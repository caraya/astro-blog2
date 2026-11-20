---
title: "Installing agents and skills"
date: 2026-12-18
tags:
  - agents
  - skills
  - AI
admonition: true
---

After you write your agents and skills, you can share them with other developers by publishing them to a repository or other strategic location where they can be accessed and installed by others.

This post will explore how to install agents and skills for your development environment using tools like Vercel's `skills` package, and the `gh` CLI.

## The problem

Working with agents and skills can become very repetitive.  Installing them manually is time-consuming, especially as the number of AI tools, agents, and skills grows.

Examples of these repetitive tasks include downloading agents to the correct directories, updating them when new versions are available, and ensuring that all required skills are installed and properly configured. Automating these tasks can save time, reduce errors and provide a consistent process for installing and updating skills.

## Installing the tools

Installing the necessary tools is the first step before you can manage agents and skills efficiently. Make sure you have Vercel's `skills` package and the GitHub CLI installed on your system.

<custom-admonition no-icon type="tip" title="Why these two tools?">
  <p>Skills and the GitHub CLI are not the only tools to manage agents and skills, but they are widely used and provide robust functionality for most development workflows.</p>
  <p>While both GitHub CLI (<code>gh skill</code>) and Vercel's Skills CLI (<code>npx skills</code>) install skills using the same open SKILL.md standard, they handle compatibility differently. <code>gh skill</code> installs from GitHub repositories or local directories and targets directories for specific agents. In contrast, npx skills supports multiple Git hosts, auto-detects installed AI tools, and symlinks skills across dozens of agent directories at once.</p>
</custom-admonition>

### Install Vercel's skills package

The `skills` CLI requires Node.js 22.20.0 or later, including all versions in the 24.x and 26.x release lines.

To view the available versions, run:

```bash
npm view skills versions
```

Replace `<version>` with a version from the list to install it globally:

```bash
npm install -g skills@<version>
```

A global installation stays on that version until you update it. Use the same version across developer environments for consistency.

You can also use `npx` to run the skills package without installing it globally.

```bash
npx skills add repo/skill-name
```

When needed, `npx` downloads the `skills` package and caches it for later runs; downloading requires a network connection. Since `npx` loads the package on demand, it may run a different version than expected.

### Install GitHub CLI

You can install the GitHub CLI by following the instructions for your platform at [https://cli.github.com/](https://cli.github.com/).

The default install requires you to download and run an installer from the GitHub CLI website. This method provides a guided installation process for your platform.

macOS users can install the GitHub CLI using Homebrew as shown below:

```bash
brew install gh
```

Once you've installed the GitHub CLI, you can verify the installation by running:

```bash
gh --version
```

Then you will have to authenticate your GitHub account by running:

```bash
gh auth login
```

## Installing agents

Installing agents is the more complex part of the setup as it involves manual installation for different environments and platforms.

These installations are different from installing skills, which are typically managed in processes using `skills` and `gh` commands. Making these agents available in the repository makes the agents available to all users who've cloned the repository.

### Project workspace in GitHub

To include an agent in your project, download it into your project's `.github/agents` directory.

This is different from installing an agent globally, as it only makes the agent available within the specific project repository.

To install the content editor for a project, run these commands from the root of the project:

```sh
mkdir -p .github/agents
curl -fsSL https://raw.githubusercontent.com/caraya/agent-skills/main/coding/agents/content-editor/agent.md -o .github/agents/content-editor.agent.md
```

Select the agent from the VS Code chat agent dropdown. Repeat the download to update it; the command overwrites the existing file. Other agents can be downloaded from their own `agent.md` paths in `coding/agents` or
`instructional-design/agents`.

### GitHub Copilot user account

To make the content editor available across projects in the Copilot harness:

```sh
mkdir -p "$HOME/.copilot/agents"
curl -fsSL https://raw.githubusercontent.com/caraya/agent-skills/main/coding/agents/content-editor/agent.md -o "$HOME/.copilot/agents/content-editor.agent.md"
```

In VS Code, select the Copilot harness to use agents from this directory.

Repeat the corresponding download to update an agent. These commands overwrite existing files with the same name.

Install any skills referenced by an agent separately. Some agents contain links to repository files; those links may need adjustment in the downloaded copy.

## Install skills

Installing skills is easier because it can be automated with the `skills` package or the GitHub CLI.

<custom-admonition no-icon type="tip" title="Chosen Example">
  <p>For the sections below, I've chosen to use GitHub Copilot as the primary example for installing agents and skills.</p>
  <p><code>skills</code> will work with other agents. See <a href="https://github.com/vercel-labs/skills/blob/main/docs/agents.md">the agents list</a> for a full list of supported agents.</p>
</custom-admonition>

### Using `skills`

Vercel's [skills](https://github.com/vercel-labs/skills#readme) package allows you to install skills for your platform or platforms.

```bash
npx skills add <owner>/<repo> --skill <skill-name> --agent github-copilot
```

You can also install from a local path by specifying the path to the skill directory:

```bash
npx skills add ./path/to/skill --agent github-copilot
```

### Using the GitHub CLI

The GitHub CLI is a GitHub-specific CLI tool that allows you to interact with GitHub from the command line. It includes commands for managing AI skills.

The `gh skill` commands are in preview and may change without notice. They install skills from GitHub repositories or local directories; for repositories hosted on other Git providers, use Vercel's `skills` CLI.

```bash
gh skill install <owner>/<repo> <skill-name>
```

To install a skill from a local directory instead of GitHub, use `--from-local`:

```bash
gh skill install ./path/to/skills-repo <skill-name> --from-local
```

Use `--agent` to select an agent and `--scope` to choose `project` or `user`. The default scope is `project`, and the default agent is `github-copilot` when running non-interactively. For GitHub Copilot, project scope uses `.agents/skills/`, and user scope uses `~/.copilot/skills/`. For example, to install a skill for GitHub Copilot across projects:

```bash
gh skill install <owner>/<repo> <skill-name> --agent github-copilot --scope user
```

To specify a destination directory instead, use `--dir`. For example, run this from the project root to install into `.github/skills/`:

```bash
gh skill install <owner>/<repo> <skill-name> --dir .github/skills
```

The `--dir` option overrides `--agent` and `--scope`. Make sure the destination is a skills directory recognized by your agent.
