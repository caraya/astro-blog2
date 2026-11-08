---
title: "Building an MCP Server in Go"
date: 2026-12-11
tags:
  - mcp
  - go
  - ai
---

The **Model Context Protocol (MCP)** is an open standard that provides a standard way for AI applications to interact with external tools and data. Instead of writing custom API integrations for every LLM application, you can build a single MCP server that works across supported clients (like Claude Desktop, Cursor, VS Code, or custom agents).

In this post, we will create an MCP server from scratch using the [`mark3labs/mcp-go`](https://github.com/mark3labs/mcp-go) SDK.

## Prerequisites

* **Go 1.27 or higher installed.**

* Basic understanding of Go web services or standard input/output (stdio) concepts.

## Step 1: Project Setup

First, create a new directory for your project and initialize a Go module.

```bash
mkdir mcp-go-demo
cd mcp-go-demo
go mod init github.com/yourusername/mcp-go-demo
```

Next, download the `mcp-go` package:

```bash
go get github.com/mark3labs/mcp-go
```

## Step 2: Creating the Base Server

The most common transport layer for desktop MCP integrations is `stdio` (Standard Input/Output). The client starts the Go binary and communicates with it via stdin/stdout.

* **Crucial Rule:** Because stdout is reserved for MCP JSON-RPC messages, **all logs must be written to stderr** (or a file).
  * **What happens if you break this?** If you use something like `fmt.Println("Server started")`, that raw text is injected directly into the communication pipe. The client (e.g., Cursor, Claude) expects strictly formatted JSON. When it tries to parse your plain text, the client's JSON parser will fail. This may cause the client to immediately throw a connection error in its UI, freeze, or forcefully terminate your Go process. Your Go app won't necessarily panic on its own, but the connection will be instantly dead!

Create a file named `main.go` and set up the basic server:

```go
package main

import (
	"fmt"
	"os"

	"github.com/mark3labs/mcp-go/server"
)

func main() {
	// 1. Create a new MCP server instance
	s := server.NewMCPServer(
		"MyGoServer",
		"1.0.0",
		server.WithToolCapabilities(false),
	)

	// 2. Start the server using the stdio transport
	fmt.Fprintf(os.Stderr, "Starting MCP server...\n")
	if err := server.ServeStdio(s); err != nil {
		fmt.Fprintf(os.Stderr, "Server error: %v\n", err)
		os.Exit(1)
	}
}


```

## Step 3: Adding a Tool (Actions)

**Tools** are executable functions that you expose to the LLM. The LLM decides when to call them based on the descriptions you provide. Let's create a simple calculator tool.

Update your `main.go` file to include the tool definition and its handler:

```go
	// Define the Tool Schema
	calculatorTool := mcp.NewTool("calculate",
		mcp.WithDescription("Perform basic arithmetic operations"),
		mcp.WithString("operation",
			mcp.Required(),
			mcp.Description("The operation to perform: add, subtract, multiply, divide"),
			mcp.Enum("add", "subtract", "multiply", "divide"),
		),
		mcp.WithNumber("a", mcp.Required(), mcp.Description("First number")),
		mcp.WithNumber("b", mcp.Required(), mcp.Description("Second number")),
	)

	// Register the Tool and its Handler
	s.AddTool(calculatorTool, func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		op, err := request.RequireString("operation")
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("invalid operation: %v", err)), nil
		}
		a, err := request.RequireFloat("a")
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("invalid value for a: %v", err)), nil
		}
		b, err := request.RequireFloat("b")
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("invalid value for b: %v", err)), nil
		}

		var result float64
		switch op {
		case "add":
			result = a + b
		case "subtract":
			result = a - b
		case "multiply":
			result = a * b
		case "divide":
			if b == 0 {
				return mcp.NewToolResultError("cannot divide by zero"), nil
			}
			result = a / b
		default:
			return mcp.NewToolResultError(fmt.Sprintf("unsupported operation %q", op)), nil
		}

		return mcp.NewToolResultText(fmt.Sprintf("%f", result)), nil
	})


```

## Step 4: Dynamically Downloading & Caching Agents and Associated Skills

To build a truly dynamic MCP server, we can design a tool that fetches an agent's base definition (`agent.md`) **and** its associated skills directly from a remote repository at runtime.

> **Note on the provided agents:** The `content-editor` and `polyglot-engineering` agents used in the upcoming examples are available in the [caraya/agent-skills](https://github.com/caraya/agent-skills) repository. They may not work in all cases, as they have been written for specific use cases. They serve as templates to learn from but should be reviewed and, potentially, edited to ensure they work for your use cases.

First, get the required packages:

```bash
go get github.com/mark3labs/kit/pkg/kit
go get golang.org/x/sync
```

Add the thread-safe caching mechanism to your `main.go` to prevent redundant network calls:

```go
var (
	cacheMu      sync.RWMutex
	contentCache = make(map[string]string)
	requestGroup singleflight.Group
)

func fetchRemoteContent(ctx context.Context, url string) (string, error) {
	cacheMu.RLock()
	if cachedContent, exists := contentCache[url]; exists {
		cacheMu.RUnlock()
		fmt.Fprintf(os.Stderr, "Cache hit for: %s\n", url)
		return cachedContent, nil
	}
	cacheMu.RUnlock()

	v, err, _ := requestGroup.Do(url, func() (interface{}, error) {
		cacheMu.RLock()
		if cachedContent, exists := contentCache[url]; exists {
			cacheMu.RUnlock()
			return cachedContent, nil
		}
		cacheMu.RUnlock()

		fmt.Fprintf(os.Stderr, "Downloading: %s\n", url)
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
		if err != nil {
			return "", err
		}

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			return "", err
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			return "", fmt.Errorf("failed to fetch %s: status %d", url, resp.StatusCode)
		}

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return "", err
		}

		content := string(body)
		cacheMu.Lock()
		contentCache[url] = content
		cacheMu.Unlock()

		return content, nil
	})

	if err != nil {
		return "", err
	}
	return v.(string), nil
}


```

### Option A: Using the `kit` SDK (Requires API Key)

You can use the `kit` library to spin up an isolated sub-agent. This requires an external API key (like Anthropic or OpenAI) injected via environment variables.

```go
	contentEditorTool := mcp.NewTool("apply_content_editor",
		mcp.WithDescription("Uses the remote Content Editor Agent (via Anthropic) to review markdown."),
		mcp.WithString("content", mcp.Required(), mcp.Description("The raw markdown to edit.")),
	)

	s.AddTool(contentEditorTool, func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		content, err := request.RequireString("content")
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}

		prompt, err := buildAgentPrompt(ctx)
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}

		agent, err := kit.NewIsolatedAgent(ctx,
			kit.WithModel("anthropic/claude-sonnet-5-5"),
			kit.WithSystemPrompt(prompt),
		)
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}
		defer agent.Close()

		response, err := agent.Prompt(ctx, "Please edit the following:\n\n" + content)
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}

		return mcp.NewToolResultText(response), nil
	})


```

### Option B: Local Execution using Simon Willison's `llm`

If you want to eliminate API costs entirely (by using local models), you can use open-source drivers. Simon Willison's highly popular [`llm` CLI utility](https://github.com/simonw/llm) allows you to pipe system prompts and user prompts to local models (via plugins like `llm-gpt4all` or `llm-llamafile`), or to paid cloud APIs via other plugins.

Instead of importing `kit`, you use Go's `os/exec` package to shell out to your locally installed `llm` binary:

```go
	localEditorTool := mcp.NewTool("apply_content_editor_local",
		mcp.WithDescription("Uses a local model via the 'llm' CLI to edit markdown for zero cost."),
		mcp.WithString("content", mcp.Required(), mcp.Description("The raw markdown to edit.")),
	)

	s.AddTool(localEditorTool, func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		content, err := request.RequireString("content")
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}

		// (Assume fullPrompt is built using fetchRemoteContent as shown above)

		userPrompt := "Please apply your skills to edit the following content:\n\n" + content

		// Shell out to Simon Willison's `llm` CLI
		cmd := exec.CommandContext(ctx, "llm", "prompt", userPrompt, "--system", fullPrompt.String())

		output, err := cmd.CombinedOutput()
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("Local LLM error: %v\nOutput: %s", err, string(output))), nil
		}

		return mcp.NewToolResultText(string(output)), nil
	})


```

*Note: For Option B to work, the machine running the MCP server must have the `llm` CLI installed and a default local model configured.*

### Which Option Should You Choose?

**Option A (`kit` SDK)** uses a native Go library to make direct HTTP calls to commercial AI providers.

* **Pros:** Runs entirely within your Go process without requiring external binaries. It provides a native, self-contained deployment. It is also maintained by `mark3labs`, the same team behind `mcp-go`, ensuring excellent ecosystem alignment.

* **Cons:** Requires an API key and incurs usage costs. It also introduces **provider lock-in**, limiting you to the specific AI providers and models supported directly by the SDK.

**Option B (`llm` CLI)** acts as a universal router for AI models.

* **Pros:** Offers **ultimate flexibility (no lock-in)**. The `llm` CLI has plugins for virtually every provider on the market. You can route the prompt to a free, locally-hosted model for zero cost, or install plugins like `llm-anthropic` to hit the exact same enterprise APIs that `kit` uses—all by changing a single CLI argument, without touching your Go code.

* **Cons:** Using the CLI with cloud plugins still incurs API costs. It also relies on the host machine having Python, the `llm` CLI, and its associated plugins/models pre-installed and configured before your MCP server will work.

## Step 5: Advanced Dynamic Routing (The Polyglot Agent)

Sometimes, you need an agent that adapts based on context. For example, a **Polyglot Engineering Agent** can load the core, performance, and formatting skills for the language it is working with, such as Python, Go, JavaScript, TypeScript, or Rust.

### The "Two LLMs" Architecture

To understand how this works across clients, it's crucial to recognize there are **two different LLMs** in this workflow:

1. **The Client LLM:** The application connecting to your server (e.g., Cursor, VS Code Copilot, Zed, or the Claude Desktop client). This LLM acts only as a *router*. It reads the user's conversation, looks at your available tools, and decides which one to call and what arguments to pass (e.g., passing "python" as the language).

2. **The Sub-Agent LLM:** The execution engine running *inside* your tool (e.g., the `llm` CLI or `kit`). It receives the dynamically assembled prompt and performs the actual work.

Because of this separation, your MCP Server remains completely client-agnostic.

### Implementation Strategy

Rather than replacing your `content_editor` tool or building a "Universal Tool" that relies on the Client LLM to hallucinate GitHub URLs, you simply **register a new tool** alongside your existing ones.

The following example adds an `apply_polyglot_engineering` tool. It accepts a task or code sample and an explicit language, fetches the Polyglot Engineering agent and that language's core, performance, and formatting skills, then sends the assembled prompt to the local `llm` CLI. The explicit language argument removes ambiguity from the sub-agent's language detection.

Add this prompt-building function at the top level of `main.go`. It uses the existing `fetchRemoteContent` helper and imports from the appendix:

```go
const polyglotAgentURL = "https://raw.githubusercontent.com/caraya/agent-skills/refs/heads/main/coding/agents/polyglot-engineering/agent.md"

func buildPolyglotPrompt(ctx context.Context, language string) (string, error) {
	skillsByLanguage := map[string][]string{
		"go":         {"go-core", "go-performance", "go-formatting"},
		"javascript": {"javascript-core", "javascript-performance", "javascript-formatting"},
		"python":     {"python-core", "python-performance", "python-formatting"},
		"rust":       {"rust-core", "rust-performance", "rust-formatting"},
		"typescript": {"typescript-core", "typescript-performance", "typescript-formatting"},
	}
	skillNames, ok := skillsByLanguage[strings.ToLower(strings.TrimSpace(language))]
	if !ok {
		return "", fmt.Errorf("unsupported language %q", language)
	}

	agent, err := fetchRemoteContent(ctx, polyglotAgentURL)
	if err != nil {
		return "", fmt.Errorf("failed to fetch Polyglot Engineering agent: %w", err)
	}

	var prompt strings.Builder
	prompt.WriteString(agent)
	for _, skillName := range skillNames {
		skillURL := fmt.Sprintf(
			"https://raw.githubusercontent.com/caraya/agent-skills/main/coding/skills/%s/SKILL.md",
			skillName,
		)
		skill, err := fetchRemoteContent(ctx, skillURL)
		if err != nil {
			return "", fmt.Errorf("failed to fetch %s skill: %w", skillName, err)
		}

		fmt.Fprintf(&prompt, "\n\n# %s SKILL\n\n%s", skillName, skill)
	}

	return prompt.String(), nil
}
```

Inside `main()`, after creating the MCP server, register the tool:

```go
polyglotTool := mcp.NewTool("apply_polyglot_engineering",
	mcp.WithDescription("Uses the Polyglot Engineering agent with language-specific skills to work on a task or code sample."),
	mcp.WithString("language",
		mcp.Required(),
		mcp.Description("The target language: Go, JavaScript, Python, Rust, or TypeScript"),
		mcp.Enum("go", "javascript", "python", "rust", "typescript"),
	),
	mcp.WithString("content", mcp.Required(), mcp.Description("The task or code sample to work on.")),
)

s.AddTool(polyglotTool, func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	language, err := request.RequireString("language")
	if err != nil {
		return mcp.NewToolResultError(err.Error()), nil
	}
	content, err := request.RequireString("content")
	if err != nil {
		return mcp.NewToolResultError(err.Error()), nil
	}

	prompt, err := buildPolyglotPrompt(ctx, language)
	if err != nil {
		return mcp.NewToolResultError(err.Error()), nil
	}

	userPrompt := fmt.Sprintf("Target language: %s\n\nTask or code sample:\n\n%s", language, content)
	cmd := exec.CommandContext(ctx, "llm", "prompt", userPrompt, "--system", prompt)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("Polyglot Engineering execution failed: %v\nOutput: %s", err, output)), nil
	}

	return mcp.NewToolResultText(string(output)), nil
})
```

For each supported language, the tool loads its core, performance, and formatting skills from the `coding/skills` directory. Add another language and its skill names to `skillsByLanguage` and the tool's enum when you want to support it. As written, this example uses the local `llm` CLI; the same assembled system prompt can be passed to the Kit SDK instead.

When a client connects, it can select this tool and provide the language based on the user's task. Tool selection and argument choice depend on the client and model.

## Step 6: Connecting Clients

Compile your server: `go build -o mcp-go-demo .`

### Claude Desktop

1. Open your Claude Desktop config file (`claude_desktop_config.json`).

2. Add your server configuration:

```json
{
  "mcpServers": {
    "my-go-server": {
      "command": "/ABSOLUTE/PATH/TO/YOUR/mcp-go-demo/mcp-go-demo",
      "args": [],
      "env": {
        "ANTHROPIC_API_KEY": "your-api-key-here"
      }
    }
  }
}


```

*(If you exclusively use the local `llm` CLI approach, you can remove the `env` block completely!)*

### VS Code (via GitHub Copilot or Cline)

Create a `.vscode/mcp.json` file in your project root:

```json
{
  "servers": {
    "my-go-server": {
      "type": "stdio",
      "command": "/ABSOLUTE/PATH/TO/YOUR/mcp-go-demo/mcp-go-demo",
      "args": [],
      "env": {
         "ANTHROPIC_API_KEY": "your-api-key-here"
      }
    }
  }
}


```

**Note on VS Code and Copilot API Keys:**
If your tool spins up a *sub-agent* making its own independent network calls (Option A), it requires its own API key. Copilot acts as the primary router, but it does not pass its internal LLM credentials down to your local binaries. If you use Option B (the `llm` CLI with local models), no API key is required at all.

## Summary

In this tutorial, we successfully built a fully functioning MCP server in Go. The process involved:

1. **Setting up an `stdio` server** that adheres to the MCP JSON-RPC protocol.

2. **Creating standard tools**, like a basic calculator.

3. **Building an advanced, dynamic tool** that fetches agent definitions and skills from remote repositories on-the-fly.

4. **Implementing a Polyglot Engineering tool** that fetches the agent and selects language-specific skills from the `coding/skills` directory.

5. **Implementing concurrency controls** using `sync.RWMutex` and `singleflight` to cache remote content.

6. **Integrating execution engines**, demonstrating both the `kit` SDK for paid cloud APIs and Simon Willison's `llm` CLI for flexible execution.

7. **Connecting the server** to multiple clients, including Claude Desktop and VS Code.

## Appendix: Complete `main.go` Code

Here is the complete, consolidated code for the MCP server featuring the calculator, API-driven and local content-editor tools, and the language-routed Polyglot Engineering tool:

```go
package main

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"sync"

	"github.com/mark3labs/kit/pkg/kit"
	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"
	"golang.org/x/sync/singleflight"
)

var (
	cacheMu      sync.RWMutex
	contentCache = make(map[string]string)
	requestGroup singleflight.Group
)

func fetchRemoteContent(ctx context.Context, url string) (string, error) {
	cacheMu.RLock()
	if cachedContent, exists := contentCache[url]; exists {
		cacheMu.RUnlock()
		fmt.Fprintf(os.Stderr, "Cache hit for: %s\n", url)
		return cachedContent, nil
	}
	cacheMu.RUnlock()

	v, err, _ := requestGroup.Do(url, func() (interface{}, error) {
		cacheMu.RLock()
		if cachedContent, exists := contentCache[url]; exists {
			cacheMu.RUnlock()
			return cachedContent, nil
		}
		cacheMu.RUnlock()

		fmt.Fprintf(os.Stderr, "Downloading: %s\n", url)
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
		if err != nil {
			return "", fmt.Errorf("failed to create request for %s: %w", url, err)
		}

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			return "", fmt.Errorf("failed to fetch content from %s: %w", url, err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			return "", fmt.Errorf("failed to fetch %s: status %d", url, resp.StatusCode)
		}

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return "", fmt.Errorf("failed to read body from %s: %w", url, err)
		}

		content := string(body)

		cacheMu.Lock()
		contentCache[url] = content
		cacheMu.Unlock()

		return content, nil
	})

	if err != nil {
		return "", err
	}

	return v.(string), nil
}

// Helper to build the prompt from remote sources
func buildAgentPrompt(ctx context.Context) (string, error) {
	baseAgentURL := "https://raw.githubusercontent.com/caraya/agent-skills/main/coding/agents/content-editor/agent.md"
	skillURLs := []string{
		"https://raw.githubusercontent.com/caraya/agent-skills/main/coding/skills/style-lookup/SKILL.md",
		"https://raw.githubusercontent.com/caraya/agent-skills/main/coding/skills/code-example-validation/SKILL.md",
	}

	var fullPrompt strings.Builder

	baseAgent, err := fetchRemoteContent(ctx, baseAgentURL)
	if err != nil {
		return "", err
	}
	fullPrompt.WriteString(baseAgent)
	fullPrompt.WriteString("\n\n# ASSOCIATED SKILLS\n")

	for _, url := range skillURLs {
		skillDef, err := fetchRemoteContent(ctx, url)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Warning: failed to load skill %s: %v\n", url, err)
			continue
		}
		fullPrompt.WriteString(fmt.Sprintf("\n## Skill Module\n%s\n", skillDef))
	}
	return fullPrompt.String(), nil
}

const polyglotAgentURL = "https://raw.githubusercontent.com/caraya/agent-skills/refs/heads/main/coding/agents/polyglot-engineering/agent.md"

func buildPolyglotPrompt(ctx context.Context, language string) (string, error) {
	skillsByLanguage := map[string][]string{
		"go":         {"go-core", "go-performance", "go-formatting"},
		"javascript": {"javascript-core", "javascript-performance", "javascript-formatting"},
		"python":     {"python-core", "python-performance", "python-formatting"},
		"rust":       {"rust-core", "rust-performance", "rust-formatting"},
		"typescript": {"typescript-core", "typescript-performance", "typescript-formatting"},
	}
	skillNames, ok := skillsByLanguage[strings.ToLower(strings.TrimSpace(language))]
	if !ok {
		return "", fmt.Errorf("unsupported language %q", language)
	}

	agent, err := fetchRemoteContent(ctx, polyglotAgentURL)
	if err != nil {
		return "", fmt.Errorf("failed to fetch Polyglot Engineering agent: %w", err)
	}

	var prompt strings.Builder
	prompt.WriteString(agent)
	for _, skillName := range skillNames {
		skillURL := fmt.Sprintf(
			"https://raw.githubusercontent.com/caraya/agent-skills/main/coding/skills/%s/SKILL.md",
			skillName,
		)
		skill, err := fetchRemoteContent(ctx, skillURL)
		if err != nil {
			return "", fmt.Errorf("failed to fetch %s skill: %w", skillName, err)
		}

		fmt.Fprintf(&prompt, "\n\n# %s SKILL\n\n%s", skillName, skill)
	}

	return prompt.String(), nil
}

func main() {
	s := server.NewMCPServer("MyGoServer", "1.0.0", server.WithToolCapabilities(false))

	// --- Calculator Tool ---
	calculatorTool := mcp.NewTool("calculate",
		mcp.WithDescription("Perform basic arithmetic operations"),
		mcp.WithString("operation", mcp.Required(), mcp.Enum("add", "subtract", "multiply", "divide")),
		mcp.WithNumber("a", mcp.Required()),
		mcp.WithNumber("b", mcp.Required()),
	)

	s.AddTool(calculatorTool, func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		op, err := request.RequireString("operation")
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("invalid operation: %v", err)), nil
		}
		a, err := request.RequireFloat("a")
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("invalid value for a: %v", err)), nil
		}
		b, err := request.RequireFloat("b")
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("invalid value for b: %v", err)), nil
		}

		var result float64
		switch op {
		case "add": result = a + b
		case "subtract": result = a - b
		case "multiply": result = a * b
		case "divide":
			if b == 0 { return mcp.NewToolResultError("cannot divide by zero"), nil }
			result = a / b
		default:
			return mcp.NewToolResultError(fmt.Sprintf("unsupported operation %q", op)), nil
		}
		return mcp.NewToolResultText(fmt.Sprintf("%f", result)), nil
	})

	// --- Dynamic Content Editor Tool (API Driven) ---
	contentEditorTool := mcp.NewTool("apply_content_editor",
		mcp.WithDescription("Uses the remote Content Editor Agent via Anthropic to refine markdown."),
		mcp.WithString("content", mcp.Required(), mcp.Description("The raw markdown content to edit.")),
	)

	s.AddTool(contentEditorTool, func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		content, err := request.RequireString("content")
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}

		prompt, err := buildAgentPrompt(ctx)
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}

		// Requires ANTHROPIC_API_KEY environment variable
		agent, err := kit.NewIsolatedAgent(ctx,
			kit.WithModel("anthropic/claude-sonnet-5-5"),
			kit.WithSystemPrompt(prompt),
		)
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("Failed to initialize sub-agent: %v", err)), nil
		}
		defer agent.Close()

		fmt.Fprintf(os.Stderr, "Applying Content Editor agent (API)...\n")
		response, err := agent.Prompt(ctx, "Please apply your skills to edit the following content:\n\n" + content)
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("Agent execution error: %v", err)), nil
		}

		return mcp.NewToolResultText(response), nil
	})

	// --- Dynamic Content Editor Tool (Zero-Cost Local via `llm`) ---
	localEditorTool := mcp.NewTool("apply_content_editor_local",
		mcp.WithDescription("Uses the remote Content Editor Agent via the local `llm` CLI to refine markdown for free."),
		mcp.WithString("content", mcp.Required(), mcp.Description("The raw markdown content to edit.")),
	)

	s.AddTool(localEditorTool, func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		content, err := request.RequireString("content")
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}

		prompt, err := buildAgentPrompt(ctx)
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}

		fmt.Fprintf(os.Stderr, "Applying Content Editor agent (Local CLI)...\n")
		userPrompt := "Please apply your skills to edit the following content:\n\n" + content

		// Shell out to Simon Willison's `llm` CLI
		cmd := exec.CommandContext(ctx, "llm", "prompt", userPrompt, "--system", prompt)

		output, err := cmd.CombinedOutput()
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("Local LLM execution error: %v\nOutput: %s", err, string(output))), nil
		}

		return mcp.NewToolResultText(string(output)), nil
	})

	// --- Polyglot Engineering Tool ---
	polyglotTool := mcp.NewTool("apply_polyglot_engineering",
		mcp.WithDescription("Uses the Polyglot Engineering agent with language-specific skills to work on a task or code sample."),
		mcp.WithString("language",
			mcp.Required(),
			mcp.Description("The target language: Go, JavaScript, Python, Rust, or TypeScript"),
			mcp.Enum("go", "javascript", "python", "rust", "typescript"),
		),
		mcp.WithString("content", mcp.Required(), mcp.Description("The task or code sample to work on.")),
	)

	s.AddTool(polyglotTool, func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		language, err := request.RequireString("language")
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}
		content, err := request.RequireString("content")
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}

		prompt, err := buildPolyglotPrompt(ctx, language)
		if err != nil {
			return mcp.NewToolResultError(err.Error()), nil
		}

		userPrompt := fmt.Sprintf("Target language: %s\n\nTask or code sample:\n\n%s", language, content)
		cmd := exec.CommandContext(ctx, "llm", "prompt", userPrompt, "--system", prompt)
		output, err := cmd.CombinedOutput()
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("Polyglot Engineering execution failed: %v\nOutput: %s", err, output)), nil
		}

		return mcp.NewToolResultText(string(output)), nil
	})

	// --- Start Server ---
	fmt.Fprintf(os.Stderr, "Starting MCP server...\n")
	if err := server.ServeStdio(s); err != nil {
		fmt.Fprintf(os.Stderr, "Server error: %v\n", err)
		os.Exit(1)
	}
}
```
