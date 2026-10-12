---
title: "Researching multi-agent communication"
date: 2026-11-11
tags:
  - AI
  - multi-agent
  - security
  - TypeScript
  - Go
---

As systems add tools and specialized agents, hosts need to manage context size, tool permissions, and execution boundaries. A larger set of tools and instructions can increase prompt size and make capability selection harder, but the effects on cost and reasoning depend on the model and workload.

The Model Context Protocol (MCP) provides a standard way for hosts to discover and use server capabilities such as tools, prompts, and resources. Skills can also be exposed through the Skills over MCP extension when both sides support it. In an architecture built with MCP, the host application controls how user intent is routed, which capabilities are made available to the model, and which security guardrails are enforced; MCP standardizes communication, but does not perform those orchestration decisions for the host.

## The Taxonomy of Agentic Systems

Designing an efficient architecture requires establishing clear boundaries between system components.

*   **Agent (Orchestrator):** The primary autonomous router. It processes user intent, manages state, and determines which sub-agents, skills, or tools to invoke.
*   **Sub-agent:** A specialized worker assigned to a specific domain (e.g., a "react-developer"). Sub-agents operate with isolated system prompts and restricted tool access.
*   **Static Skills:** Designing an agent with predefined operational scope baked directly into its system prompt. This is efficient for highly specific sub-agents but scales poorly for broad orchestrators.
*   **Dynamic Skills:** Reusable, procedural knowledge loaded on demand. The host orchestrator can retrieve task-specific instructions from a registry or, when supported, through the Skills over MCP extension. It can then make the relevant instructions and tool schemas available to the model.
*   **Tool:** A functional component that executes operations against external APIs, databases, or local environments.

Instead of one agent juggling every capability, the host shifts complexity from prompt management to orchestration. It determines the intent and either loads a dynamic skill into its context or routes the task to a sub-agent. MCP can supply the capabilities used by this flow, while routing remains host-application behavior.

### Discovering Skills over MCP

The finalized [Skills extension](https://modelcontextprotocol.io/extensions/skills/overview) defines a protocol flow for discovering skills and reading their files. A server advertises the `io.modelcontextprotocol/skills` extension and the `resources` capability. The host can then list skill entries, select a skill, and read its `SKILL.md` as a resource:

```text
server/discover  -> resources capability + io.modelcontextprotocol/skills extension
skills/list      -> skill URI + frontmatter + file manifest
resources/read   -> selected SKILL.md content
```

The host, not MCP, verifies the content against the manifest, tracks the originating server, applies any approval policy, and decides how to load the instructions into model context. The extension does not define this example's `requiredToolNames` mapping; that remains host or application policy. This is a protocol sketch, not a runnable call using the TypeScript SDK shown below; check the current SDK support before wiring it into a client.

## Token Optimization and Security Guardrails

MCP servers expose protocol capabilities to a host; servers that support the Skills over MCP extension can also make skills available through MCP. The host orchestrator selects which tool schemas to include in each model request, which can reduce input-token use. Routing, per-session permissions, and user-approval flows belong to the host application. MCP does not provide process isolation; deployments must enforce it separately. The Go example below invokes `npx tsc` directly and does not implement containerization or sandboxing.

Allowing models to write code, access databases, and trigger workflows asynchronously introduces severe risks. The host application and its deployment must enforce guardrails such as:

1.  **Process Isolation:** Run tools with least privilege in an isolated execution environment to limit the blast radius if an agent executes malicious code. Containerization can help, but packaging a tool in an image does not itself provide process isolation.
2.  **Transport Security:** MCP authorization is optional. For HTTP transports that require access control, follow the [MCP OAuth authorization flow](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization) and validate that access tokens are intended for the server. For stdio, do not use the HTTP OAuth flow; obtain credentials from the environment and secure which local processes can launch the server. For other transports, follow their established security practices.
3.  **Human-in-the-Loop (HITL):** Have the host pause the execution pipeline and require explicit human approval before invoking tools that perform state-changing operations (such as database writes), financial transactions, or unsandboxed local commands.
4.  **Graceful Tool Handling:** If an agent attempts to invoke a tool that is unavailable or restricted, intercept the failure and return a natural language error to the LLM so it can recover, rather than crashing the runtime.

### Sandboxing Tool Execution

A Docker image packages a filesystem and its dependencies; it is not an isolation boundary. Running a tool in a standard container can add useful controls, but containers share the host kernel, and their protection depends on runtime configuration. Do not treat "packaged in an image" as equivalent to "sandboxed."

For agents or tools that need broad command execution, consider a purpose-built sandbox such as [Docker Sandboxes](https://www.docker.com/products/docker-sandboxes/) or a comparable microVM- or VM-based implementation. Docker describes Sandboxes as running agents in microVMs with a separate kernel and private Docker Engine. Evaluate the actual isolation model, and configure what can cross the boundary, including workspace mounts, network access, credentials, and CPU and memory limits. A writable workspace mount or an allowed network route still gives the sandbox access to those resources.

Sandboxing the agent does not necessarily sandbox its MCP servers. For example, Docker documents that local stdio MCP servers run on the host, outside the sandbox VM. If an MCP server launches tools on the host, isolate that server and its child processes separately. The Go typecheck example below is an internal stdio tool; it does not claim to sandbox the compiler.

### Applying Sandboxing to These Examples

The TypeScript orchestrator does not execute the compiler, so it does not need a sandbox-specific LLM adapter. Keep its per-session tool filtering, but treat that as tool availability control, not execution isolation:

```typescript
payload.tools = mcpTools.tools.filter(tool =>
  activeSkill.requiredToolNames.includes(tool.name)
);
```

The Go MCP server is the execution boundary in this example. To move compilation off the host, provision a named Docker SBX sandbox with Node.js, TypeScript, and `timeout` installed. Configure its CPU, memory, workspace, and network policies separately; the commands below run work in an existing sandbox but do not set those policies. The Go helper below is an alternative to steps 2-4 in the main handler: replace the temporary-file and host-side `npx tsc` block with this function, then return its output through `mcp.NewToolResultText`. If you use this alternative, add `"path/filepath"` to the main Go example's imports; the direct-execution version does not need it.

```go
func runTypecheckInSandbox(ctx context.Context, sandboxName, code string) (string, error) {
  sourceFile, err := os.CreateTemp("", "typecheck-*.ts")
  if err != nil {
    return "", fmt.Errorf("create source file: %w", err)
  }
  defer os.Remove(sourceFile.Name())

  if _, err := sourceFile.WriteString(code); err != nil {
    sourceFile.Close()
    return "", fmt.Errorf("write source file: %w", err)
  }
  if err := sourceFile.Close(); err != nil {
    return "", fmt.Errorf("close source file: %w", err)
  }

  sandboxPath := "/tmp/" + filepath.Base(sourceFile.Name())
  copyCmd := exec.CommandContext(ctx, "sbx", "cp", sourceFile.Name(), sandboxName+":"+sandboxPath)
  if output, err := copyCmd.CombinedOutput(); err != nil {
    return "", fmt.Errorf("copy source into SBX: %w: %s", err, output)
  }
  defer exec.Command("sbx", "exec", sandboxName, "rm", "-f", sandboxPath).Run()

  command := exec.CommandContext(ctx, "sbx", "exec", sandboxName,
    "timeout", "10s", "tsc", "--noEmit", "--skipLibCheck", sandboxPath,
  )
  output, err := command.CombinedOutput()
  if err != nil {
    return string(output), fmt.Errorf("typecheck failed: %w", err)
  }
  return string(output), nil
}
```

The sandbox must already be running; the helper stages and removes each source file but does not create or delete the sandbox. Restrict the sandbox's workspace and network access, and set CPU and memory limits in its SBX configuration. Merely launching the stdio MCP server or agent inside Docker Sandboxes does not move a separately host-launched compiler into its microVM.

## Implementing the Orchestrator in TypeScript

This implementation demonstrates an orchestrator that connects to an MCP server, uses an LLM to determine user intent, dynamically loads the appropriate skill, and handles missing tools gracefully.

These snippets are excerpts from one TypeScript module, not standalone files. Use a TypeScript project and install the MCP SDK v2 client package with `npm install @modelcontextprotocol/client`. The `serverPath` argument must point to a runnable MCP server. The shared declarations below define the skill registry and the provider-neutral LLM adapter contract. Implement that adapter for your LLM provider, translating MCP tool schemas into the provider's format and normalizing its responses to the contract shown here, including tool-call IDs and tool-result messages.

```typescript
type DynamicSkill = {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  requiredToolNames: string[];
};

type LLMToolCall = {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
};

type LLMMessage =
  | { role: 'user'; content: string }
  | { role: 'assistant'; content?: string; toolCalls?: LLMToolCall[] }
  | { role: 'tool'; toolCallId: string; content: string };

type LLMResponse = {
  content?: string;
  toolCalls?: LLMToolCall[];
};

interface LLMClient {
  complete(input: {
    system: string;
    messages: Array<{ role: 'user'; content: string }>;
    temperature: number;
  }): Promise<{ text: string }>;
  chat(input: {
    system: string;
    messages: LLMMessage[];
    tools: unknown[];
  }): Promise<LLMResponse>;
}

const skills: DynamicSkill[] = [
  {
    id: 'typescript',
    name: 'TypeScript',
    description: 'Run TypeScript type checks.',
    systemPrompt: 'You are a TypeScript development assistant.',
    requiredToolNames: ['execute_typecheck']
  }
];

async function fetchAvailableSkills(): Promise<DynamicSkill[]> {
  // In-memory stand-in for a registry or Skills over MCP source.
  return skills;
}
```

### 1. Connecting to the MCP Server

Use the official MCP TypeScript SDK to connect the orchestrator to external tool and skill servers via standard input/output (stdio).

```typescript
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

export async function createMCPClient(serverPath: string): Promise<Client> {
  const transport = new StdioClientTransport({
    command: serverPath,
    args: []
  });

  const client = new Client({ name: 'orchestrator-client', version: '1.0.0' });

  await client.connect(transport);
  return client;
}
```

### 2. Building the LLM-Based Intent Router

Instead of brittle keyword matching, use a lightweight LLM call to evaluate the user's intent against the available dynamic skills. The LLM acts as a semantic router.

```typescript
export async function routeIntent(
  userInput: string,
  availableSkills: DynamicSkill[],
  llmClient: LLMClient
): Promise<DynamicSkill | undefined> {

  const skillDescriptions = availableSkills.map(
    s => `- ID: ${s.id} | Description: ${s.description}`
  ).join('\n');

  const systemPrompt = `You are a semantic router. Match the user request to the most relevant skill ID from the list below. If none match, output "none".
Available Skills:
${skillDescriptions}

Output ONLY the exact skill ID or "none".`;

  const response = await llmClient.complete({
    system: systemPrompt,
    messages: [{ role: 'user', content: userInput }],
    temperature: 0.0
  });

  const selectedId = response.text.trim();
  return availableSkills.find(skill => skill.id === selectedId);
}
```

### 3. Handling Missing Tools Gracefully

Before executing a tool call, check that the host's session policy allows the tool and that the MCP server currently exposes it. A tool call selected by the model is not authorization. Return a tool result explaining denials or unavailable tools so the model can report the limitation or choose another approach. This example's allowlist is session-level; applications with user-specific permissions must enforce those in the host or MCP server as well.

```typescript
export async function executeToolSafely(
  client: Client,
  allowedToolNames: ReadonlySet<string>,
  toolName: string,
  args: Record<string, unknown>
): Promise<string> {
  if (!allowedToolNames.has(toolName)) {
    console.warn(`[Execution Guard] Tool ${toolName} is not allowed for this session.`);
    return `Tool error: '${toolName}' is not authorized for this session.`;
  }

  try {
    const { tools } = await client.listTools();
    const toolExists = tools.some(t => t.name === toolName);

    if (!toolExists) {
      console.warn(`[Execution Guard] Tool ${toolName} requested but unavailable.`);
      return `Tool error: '${toolName}' is unavailable on the MCP server.`;
    }

    const result = await client.callTool({
      name: toolName,
      arguments: args
    });

    return JSON.stringify(result);
  } catch (error) {
    return `System Note: Tool execution failed due to an error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}
```

### 4. The Complete Orchestration Flow

The orchestrator ties these components together. It routes the intent, dynamically constructs the prompt payload, and maintains a lean token footprint.

```typescript
export async function executeAgentSession(userInput: string, mcpClient: Client, llmClient: LLMClient) {
  // 1. Fetch available skills (e.g., from a database or MCP resource list)
  const availableSkills = await fetchAvailableSkills();

  // 2. Semantically route the intent
  const activeSkill = await routeIntent(userInput, availableSkills, llmClient);

  // 3. Construct the baseline payload and conversation history
  const payload = {
    system: 'You are a helpful orchestrator. Answer general questions directly.',
    tools: [] as unknown[]
  };
  const messages: LLMMessage[] = [{ role: 'user', content: userInput }];

  // 4. Dynamically inject skill context and MCP schemas
  if (activeSkill) {
    console.log(`[Orchestrator] Loading dynamic skill: ${activeSkill.name}`);
    payload.system = activeSkill.systemPrompt;

    // Fetch tool schemas from the MCP server matching the skill's required tools
    const mcpTools = await mcpClient.listTools();
    payload.tools = mcpTools.tools.filter(t =>
      activeSkill.requiredToolNames.includes(t.name)
    );
  } else {
    console.log('[Orchestrator] No specialized skill required. Using baseline context.');
  }

  // 5. Continue inference after each tool round, with a limit to prevent runaway calls
  const allowedToolNames = new Set(activeSkill?.requiredToolNames ?? []);
  const maxToolRounds = 5;

  for (let round = 0; round <= maxToolRounds; round += 1) {
    const response = await llmClient.chat({ ...payload, messages });
    const toolCalls = response.toolCalls ?? [];

    if (toolCalls.length === 0) {
      return response;
    }

    if (round === maxToolRounds) {
      throw new Error(`Exceeded the limit of ${maxToolRounds} tool-call rounds.`);
    }

    messages.push({
      role: 'assistant',
      ...(response.content === undefined ? {} : { content: response.content }),
      toolCalls
    });

    for (const call of toolCalls) {
      const result = await executeToolSafely(
        mcpClient,
        allowedToolNames,
        call.name,
        call.arguments
      );

      messages.push({ role: 'tool', toolCallId: call.id, content: result });
    }
  }

  throw new Error('Tool-call loop ended unexpectedly.');
}
```

## The MCP Backend: Go Server Implementation

To support the TypeScript orchestrator, expose the underlying tools through an MCP server. Go is a good fit for a self-contained server executable. The Go code and its Go library dependencies are included at compile time; the executable does not need a separate Go or CGO runtime. Using the `mark3labs/mcp-go` SDK, you can expose a tool over `stdio`.

Before building, initialize a Go module (for example, with `go mod init example.com/mcp-server`) and add the latest SDK release with `go get github.com/mark3labs/mcp-go@latest`. The Go executable is self-contained at compile time, but this example launches `npx tsc`, so Node.js/npm and TypeScript are separate runtime dependencies. Install TypeScript in the project with `npm install --save-dev typescript`.

This example uses stdio, so access is mediated by the local host and its configuration rather than a remotely exposed MCP endpoint. The 50,000 character schema limit and 10-second compiler command timeout are defense-in-depth for this internal tool, not controls against external callers. A timeout does not cap memory, and `--noEmit` does not isolate the compiler. If the source code is untrusted in your deployment, enforce resource and isolation limits with the operating system or a container; a subprocess alone is not a security boundary.

```go
package main

import (
  "context"
  "fmt"
  "log"
  "os"
  "os/exec"
  "time"

  "github.com/mark3labs/mcp-go/mcp"
  "github.com/mark3labs/mcp-go/server"
)

func main() {
  s := server.NewMCPServer(
    "PolyglotDeveloperServer",
    "1.0.0",
    server.WithToolCapabilities(true),
  )

  tool := mcp.NewTool("execute_typecheck",
    mcp.WithDescription("Runs the TypeScript compiler to verify types."),
    mcp.WithString("code",
      mcp.Required(),
      mcp.Description("The source code to typecheck"),
      mcp.MaxLength(50000),
    ),
  )

  s.AddTool(tool, func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
    // 1. Extract and validate the code argument
    code, err := request.RequireString("code")
    if err != nil {
      return mcp.NewToolResultError(err.Error()), nil
    }

    // 2. Create an isolated temporary file to hold the code
    tmpFile, err := os.CreateTemp("", "typecheck-*.ts")
    if err != nil {
      return mcp.NewToolResultError(fmt.Sprintf("Failed to create temp file: %v", err)), nil
    }
    defer os.Remove(tmpFile.Name()) // Ensure cleanup occurs

    // 3. Write the code to the file
    if _, err := tmpFile.WriteString(code); err != nil {
      tmpFile.Close()
      return mcp.NewToolResultError(fmt.Sprintf("Failed to write to temp file: %v", err)), nil
    }
    tmpFile.Close()

    // 4. Run the typechecker as a subprocess; a subprocess is not a security boundary
    // Using npx tsc to compile without emitting actual JS files
    toolCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
    defer cancel()
    cmd := exec.CommandContext(toolCtx, "npx", "tsc", "--noEmit", "--skipLibCheck", tmpFile.Name())
    output, err := cmd.CombinedOutput()

    // 5. Evaluate the result and return to the MCP client
    if err != nil {
      // If execution fails, return the error and the compiler's text output
      return mcp.NewToolResultText(fmt.Sprintf("Typecheck failed:\n%s", string(output))), nil
    }

    return mcp.NewToolResultText(fmt.Sprintf("Typecheck passed successfully.\nOutput:\n%s", string(output))), nil
  })

  if err := server.ServeStdio(s); err != nil {
    log.Fatalf("Server error: %v", err)
  }
}
```

From the Go module root, create an output directory and build the current package with `.`. This compiles all Go files in the server package, not only `main.go`:

```bash
mkdir -p build
GOOS=darwin GOARCH=arm64 go build -o build/mcp-server-darwin-arm64 .
GOOS=linux GOARCH=amd64 go build -o build/mcp-server-linux-amd64 .
```

The resulting Go executables still need Node.js/npm and TypeScript at runtime for the `execute_typecheck` tool, unless you replace the host-side `npx tsc` invocation with the Docker SBX flow above.

## Conclusion

This article has shown one way to combine a host-side intent router, selectively loaded skill context, MCP tool discovery, and a Go stdio server. The Skills over MCP flow is a protocol sketch, and the Docker SBX code is an alternative for running the compiler inside an existing sandbox; neither is a complete production integration.

The host and server still need to supply the provider-specific LLM adapter, skill registry and activation flow, user-facing approval, and any user-specific authorization policy. Deployments must also configure their own sandbox and resource policies when tool execution needs isolation. MCP provides the communication and capability-discovery layer, not those application and deployment decisions.

## Resources

* [MCP specification, 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28)
* [MCP security best practices](https://modelcontextprotocol.io/specification/2026-07-28/basic/security_best_practices)
* [MCP authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization)
* [Skills over MCP extension](https://modelcontextprotocol.io/extensions/skills/overview)
* [Agent Skills specification](https://agentskills.io/specification)
* [MCP TypeScript SDK v2 documentation](https://ts.sdk.modelcontextprotocol.io/v2/), including the [client connection](https://ts.sdk.modelcontextprotocol.io/v2/clients/connect.html) and [tool-calling](https://ts.sdk.modelcontextprotocol.io/v2/clients/calling.html) guides
* [Official MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
* [mcp-go documentation](https://pkg.go.dev/github.com/mark3labs/mcp-go) and [source repository](https://github.com/mark3labs/mcp-go)
* [Docker Sandboxes documentation](https://docs.docker.com/ai/sandboxes/), including [usage](https://docs.docker.com/ai/sandboxes/usage/) and [security model](https://docs.docker.com/ai/sandboxes/security/)
