---
title: "Why I don't trust AI prompts"
date: 2026-10-21
tags:
  - AI
  - prompts
  - reliability
---

When I see folks writing about AI in many fields, I see prompts and prompt engineering being emphasized as the key to success, without really paying attention to what they can and cannot do in practice. This often leads to unrealistic expectations and disappointment when the AI doesn't perform as hoped.

In my experience, relying solely on prompts can be misleading. While they can guide the AI to produce certain outputs, they don't guarantee quality, accuracy, or relevance. The AI's responses are influenced by its training data and inherent limitations, which prompts alone cannot overcome.

In this post, I will outline some of the issues I see with prompts, how they can mislead users, and how we can move toward a more reliable and effective way of working with AI.

## Thought exercise

Let's start with a simple exercise to frame the rest of the post. Create a prompt in your field (or use an existing prompt) and run it through your favorite AI tool five times.

Did the AI produce consistent results? If not, why do you think that happened?

If you have access to multiple AI assistants (ChatGPT, Gemini, Claude, or others), run the same prompt through each of them and compare the results. Did different AI assistants produce similar outputs, or were there significant variations?

These variations illustrate why a prompt alone is not a reproducible specification. Although variations can have different causes, including differences in models, system instructions, available tools, and guardrails, current web-based AI assistants share practical limitations.

## LLM limitations

To understand the problems with prompts, we need to understand the limitations of the large language models (LLMs) that process those prompts.

* **Non-deterministic**: Within a single system, the same prompt does not guarantee the same response across repeated submissions. This behavior is common across commercially available AI assistants, although its degree and form vary among tools.
* **Subject to inaccurate or fabricated output**: Fluent, plausible responses may contain false, misleading, or nonsensical claims that the system cannot substantiate, regardless of how well the prompt is crafted.
* **Subject to bias**: Responses can reflect biases in the model's training data, which can produce unfair or prejudiced results regardless of prompt quality.
* **Context- and boundary-limited**: Training cutoffs, context windows, system instructions, safety controls, and available tools constrain what each system can produce. Without access to current sources, responses may also be outdated or incomplete.

## How working in groups exacerbates these issues

Here I'm thinking of two particular cases:

* Teachers collaborating on lesson plans for multiple sections of the same class
* An engineering team implementing a feature for a larger project

### Time

Creating content with prompts, or any AI tool, can be time-consuming, perhaps even more so than completing the task without AI assistance. The time spent crafting prompts, evaluating unexpected variants, and verifying facts can erase the expected time savings.

### Reproducibility

Unless you save your prompt and the context in which it was used, it can be difficult to reproduce or understand the AI's output. This can lead to confusion, miscommunication, and challenges in verifying the accuracy or reliability of the AI's responses.

Prompts alone don't establish quality, reliability, or alignment.

### Consensus

When a shared prompt produces divergent results, whose output becomes the source of truth? Each team member may interpret the drafts through their own perspective, making standardization difficult.

How do teams' own biases and perspectives influence the interpretation of AI-generated content?

### Accountability

When using AI-generated content, it is important to disclose its origin to maintain transparency and accountability. This includes identifying the prompts and tools used, particularly when original work is submitted to an employer, educator, accreditation body, or professional standards board as evidence of a person's competence.

When it comes time to evaluate AI-generated or AI-assisted content, do we use the same evaluation criteria as we would for human-generated content? Do we make evaluation harder if the content is produced by AI or in collaboration with AI?

## Moving from prompts to collaboration

Rather than rely on a prompt as a content generator, we should treat it as the starting point for an iterative collaboration with an AI system. Subsequent interactions can shape and refine the content, but reliability still depends on human oversight: defining acceptance criteria, verifying claims, preserving relevant context, and reviewing the final result.

## Evolving into an agent world

The next step in this evolution is an agent-based approach, in which AI systems can pursue defined goals, use specialized tools or skills, make decisions, and take actions within established boundaries. These capabilities may improve efficiency on complex tasks, but they do not eliminate the limitations of prompts or models.

Because agents can act on their outputs and interact with their environment, they require stronger safeguards, including clear permissions, evaluation criteria, audit trails, and human review. This shift changes how we approach content creation, decision-making, and collaboration with AI, requiring new frameworks for trust, responsibility, and human-AI interaction.
