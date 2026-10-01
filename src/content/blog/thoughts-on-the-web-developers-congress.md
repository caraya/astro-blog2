---
title: "Thoughts on the Web Developers Congress: North America"
tags:
  - web development
  - AI
  - Opinion
date: 2026-10-02
draft: true
status: needs-review
---

The Web Developers Congress North America was a mixed experience, showcasing the latest trends in AI but, in my opinion, leaving other areas of development underrepresented and, at times, not included at all. I get it that most developers are focused on AI but I believe a balanced approach that also highlights other critical aspects of the development experience is essential for the community's growth.

This post presents my reflections and takeaways from the event.

## Everyone is pivoting to AI

The overwhelming focus on AI was evident in almost every session and discussion. While this reflects the current industry trend, it also raises concerns about the potential neglect of other important areas such as performance optimization, security, and accessibility.

The way companies are integrating AI into their tools and how those tools are pushing fully agentic workflows is both exciting and concerning. While the potential for increased productivity and innovation is immense, there is also a risk of over-reliance on AI, which could lead to a decline in fundamental development skills and critical thinking.

Despite the advancements in AI, human oversight remains crucial. AI can assist in automating repetitive tasks and providing insights, but it lacks the nuanced understanding and the larger context that humans bring to the table. I'm not comfortable with a scenario where AI can push PRs, even if they are trivial or minor changes. There should always be human approval built into the loop at some point of the process.

Ensuring that humans remain in the loop helps maintain accountability, quality, and the ability to make informed decisions that consider broader implications beyond what AI can comprehend.

## Docker

Docker presents an interesting set of tools and practices for containerization and AI integration. It allows developers to create isolated environments for their applications, ensuring consistency across different stages of development and deployment. Additionally, Docker's support for AI workloads enables seamless experimentation and deployment of AI models within containerized applications.

There are three items worth highlighting when it comes to Docker's approach to AI integration:

### Hardened images

[Hardened images](https://docs.docker.com/dhi/) provide a more secure foundation for creating applications with Docker. This reduces the risk of supply chain attacks and vulnerabilities by ensuring that the base images used are thoroughly secure, vetted, and maintained.

### Containers

[Containers](https://docs.docker.com/ai-overview/) provide isolated environments for running AI workloads, ensuring consistency across different stages of development and deployment. Instead of creating image-based containers (what we're used to when thinking about Docker), it uses configurable micro virtual machines (VMs) that restrict what the agent or application can access, enhancing security and reducing the risk of unintended interactions with the host system.

They go beyond hardened images by providing isolated and controlled environments for running AI workloads, providing secure environments and making it more difficult for AI agents to escape their sandboxes and affect the local host or external systems (like the Open AI breakouts in the news recently).

### Kits (extensions to dockerfile)

[Kits](https://docs.docker.com/ai/sandboxes/customize/) provide a set of reusable components and configurations to extend and customize Dockerfiles for AI workloads, making it easier to create tailored containerized environments.

This helps streamline the process of setting up AI-ready Docker environments, reducing the time and effort required to configure and maintain containerized applications for AI workloads.

## Akamai

Akamai's evolution is even more striking to me than pretty much anything other evolution (Docker, GitHub) I saw at the conference.  I first learned about Akamai when it was a content delivery network (CDN) primarily dealing with streaming video content. In the last five years Akamai has pivoted from a traditional Content Delivery Network (CDN) to a more comprehensive cloud services provider, focusing on security, edge computing, and AI-driven solutions like the [Akamai Inference Cloud Platform](https://www.akamai.com/products/akamai-inference-cloud-platform).

But perhaps the most interesting recent development is Akamai's [partnership with Anthropic](https://www.reuters.com/technology/akamai-anthropic-sign-116-billion-cloud-services-deal-2026-09-24/) in a long-term partnership worth $1.16 billion.

The implicit assumption is that AI will remain a central and transformative force in the technology landscape, driving the need for advanced infrastructure and partnerships like the one between Akamai and Anthropic, but we don't have certainty about the long-term trajectory of AI adoption and its impact on the industry.

## GitHub

GitHub, a Microsoft company, has been increasingly integrating AI capabilities into its platform, particularly through tools like GitHub Copilot and Copilot CLI.

### Canvas apps

The most intriguing thing I saw was the way you could create web-based, graphical, applications directly from copilot chat.

These reusable apps can leverage your existing agents and skills to create easier to use graphical interfaces for AI-driven workflows.

The catch is that you must be very specific in your prompt. Unless you specifically tell it that it's a reusable prompt or that it should generate a reusable app, it may not create one that can be reused in the future.

### Copilot CLI

## Testing with AI

Qodo, Sonar, and other companies invested heavily in automating the testing phase of the Software Development Life Cycle (SDLC), leveraging AI to improve code quality, security, and overall development efficiency.

What always worry me, again, is the human in the loop and how much responsibility and oversight is required to ensure that AI-driven testing produces reliable and accurate results.

Another question to ask is how to ensure that AI tests are actually testing the code as is and not testing buggy code to produce results. I prefer to write the core, must pass, tests manually and then let AI assist with additional test coverage. This way a human is responsible for the critical aspects of testing and can oversee the AI-generated tests to ensure their validity and reliability.

## Tools to review later

### Mintlify

[Mintlify](https://mintlify.com) presents an interesting AI use case: building AI-assisted documentation for software projects. It leverages AI to automatically generate and maintain documentation, making it easier for developers to keep their project documentation up-to-date and accurate.

### Antithesis

[Antithesis](https://antithesis.com/) provides tools for building AI-driven applications, focusing on enhancing developer productivity and streamlining the integration of AI capabilities into software projects.

### Text Control

[Text Control](https://textcontrol.com) provides tools to create document processing workflows, enabling developers to integrate document generation, editing, and management capabilities into their applications.

## Projects and ideas

### Slide generator

While Google Slides and Microsoft PowerPoint offer Model Context Protocols (MCPs) to interact with their products programmatically, there are limitations to their use.

The Google Slides MCP relies on batch updates and user understanding of the API commands necessary to perform actions, which can be cumbersome and error-prone when generating full presentations. It is also part of an early release program that requires business addresses which, in my opinion, excludes individual developers who want to test the API independently. I plan to revisit the Google MCP once it becomes generally available.

There are several MCPs that interact with Microsoft PowerPoint, but they all have disadvantages. The most powerful PPT MCP requires Python installed on the system you want to run in or a limited environment, and it is also restricted in terms of available functionality compared to what you can achieve manually within PowerPoint itself.

Instead I plan to explore alternative, open source, presentation systems [Inspire.js](https://inspirejs.org/) as the presentation engine and an agent as the authoring tool.

The challenge is how to teach the agent enough to build the presentation without having to rebuild the entire presentation tool for every presentation.

### Voice recording, transcription and sentiment analysis

Most of the time, when you're doing an interview or recording a conversation, you want to capture both the words spoken and the sentiment expressed.

The tool will use the following tools and libraries:

* The web Audio API to capture and process audio from the input device.
* AI agent (Deepgram or Modulate) to transcribe and analyze sentiment from the recorded audio.
* A vector database (PostgreSQL with pgvector) to create embeddings and store the transcribed text along with sentiment and analysis result.
* React with a Markdown library to render the transcribed text and sentiment analysis results and to allow for annotations

Packages like [Deepgram](https://deepgram.com) or [Modulate](https://modulate.ai) can be used for capture, transcription, and sentiment analysis before we do human annotation.

## Conclusions: guarded optimism

Looking back, the Web Developers' Congress provided valuable insights into the current state and future directions of web development. While there are many promising tools and technologies emerging, it is important to approach them with a sense of guarded optimism, recognizing both their potential and their limitations.
