---
title: "Chimero, McLuhan, And The Grain Of The Web"
date: 2026-06-27
tags:
  - Design
  - Web Development
  - Media Theory
draft: true
---

Frank Chimero’s essays, "[What Screens Want](https://frankchimero.com/blog/2013/what-screens-want/)" (2013) and "[The Web's Grain](https://frankchimero.com/blog/2015/the-webs-grain/)" (2015), establish a unified, foundational philosophy for digital design. Together, they argue that digital spaces are not empty canvases, nor are they mere digital extensions of print media. Instead, screens and the web possess inherent material properties—a natural "grain"—that designers must recognize and embrace.

For decades, digital design was plagued by practitioners attempting to force the rules of print—fixed dimensions, absolute control over typography, and static layouts—onto an inherently rebellious medium. Chimero’s intervention asks designers to adopt a "beginner’s mind": to drop heavy preconceptions, look at the raw materials of the web, and observe what those materials naturally want to do.

When analyzed together, Chimero's principles provide both practical design guidance and a profound sociological critique that echoes Marshall McLuhan's mid-century media theory. To truly understand these principles, one must look at how the web has structurally evolved.

## Semiotics and the grain of the web

To fully appreciate Chimero’s philosophy, it is useful to frame his arguments through the lens of semiotics, the study of signs, symbols, and meaning-making, as developed by theorists like [Ferdinand de Saussure](https://www.ebsco.com/research-starters/history/ferdinand-de-saussure), [Charles Sanders Peirce](https://plato.stanford.edu/entries/peirce-semiotics/), and [Roland Barthes](https://www.ebsco.com/research-starters/history/roland-barthes).

Quick primer: semiotics treats each sign as a form (the signifier) paired with a meaning (the signified). Peirce classifies signs by their relationship to what they point to—an index points to a real-world cause (smoke → fire), an icon resembles its object (a photograph), and a symbol depends on convention (a word). Barthes' "mythologies" show how culture adds extra meaning to ordinary signs. In these terms, every design decision is a signifier that shapes how users interpret and interact with digital environments.

Chimero’s critique of skeuomorphism and structural metaphors is fundamentally semiotic. Skeuomorphic designs use visual signs borrowed from the physical world (like leather textures or paper metaphors) to help users interpret digital interfaces. This aligns with Barthes’ idea of "mythologies" — how culture layers extra meaning onto everyday signs. However, as Chimero argues, these signs can become outdated or misleading as users gain digital literacy.

Instead, Chimero urges designers to recognize and work with the web’s native signs—the inherent properties of the medium, such as fluidity, vertical stacking, and flux. This echoes Peirce’s idea of the indexical sign (for example, smoke indicating fire), where the signifier is directly linked to its material cause. By embracing the web’s grain, designers allow the medium’s true nature to become the primary signifier, rather than imposing external metaphors.

In this way, Chimero’s work extends the semiotic tradition into the digital age, showing that the meaning of digital design arises not just from visual style or content, but from the structural and material qualities of the medium itself.

## The material nature of digital design

### The role of flux and fluidity

In "What Screens Want," Chimero writes: "The screen is a space of flux. It is not a canvas, but a stream." He identifies the core nature of the screen not as a static visual plane, but as a medium defined by time, movement, and change. Because the origins of screens trace back to early motion photography—specifically Eadweard Muybridge’s 19th-century experiments with capturing a horse in motion—interaction design shares more structural DNA with filmmaking than with print design. The screen is essentially a lightbulb that engineers have trained to dance.

"The Web's Grain" applies this concept of flux directly to browser environments. As Chimero puts it, "The web is at its best when it is allowed to be a little bit messy, a little bit unpredictable, and a little bit wild." The web’s natural, unstyled state is fluid. It inherently adapts to the width of the viewport and stacks elements vertically, like a layer cake. The foundational tension in web design arises from how different elements react to this fluidity. For example, images generally scale proportionally to maintain their aspect ratio, while text scales fluidly, wrapping and becoming shorter as the container grows wider. This unavoidable contradiction remains the root of responsive design challenges.

* **Working against the web's grain**: When designers attempt to perfectly lock text and images into rigid, side-by-side grids, they fight the medium. A designer might create a promotional webpage that functions like a cinematic, fixed-aspect-ratio poster. They use complex JavaScript to hijack the user's scroll wheel, forcing the page to snap to specific sections. On a mobile device, this fragile architecture shatters: text becomes unreadably narrow, images break their containers, and the scroll hijacking makes the site feel broken. Chimero famously calls this a "bicycle bear" website. Observers might find it technically impressive that an engineer taught a bear to ride a bicycle, but the act is ultimately clumsy, unnatural, and hostile to the bear's true nature.
* **Embracing the web's grain**: A designer creates a layout that respects browser fluidity and the unavoidable tension between text and image scaling. Using relative units and flexible CSS techniques like Flexbox or CSS Grid, the design allows the content to flow. On narrow screens, it naturally stacks vertically; as the viewport widens, it expands organically. Furthermore, the interface uses movement functionally rather than purely decoratively. Elements like smooth scrolling to a target section or a sliding menu that visually reveals its origin point help users understand their spatial location within the digital environment.

### Evolving past visual and structural metaphors

As computing power increases, the physical hardware of computers shrinks, leaving the screen as the primary interaction point. Chimero compares this evolution to modern aspirin: the active medication is so microscopic that pharmaceutical companies must add physical filler just so people can pick up the pill. In early software, visual abstractions and physical metaphors (like a literal "Trash Bin" or a leather-bound "Address Book") acted as this filler, making complex data manipulation accessible to novices. However, as users achieve digital literacy, these heavy-handed metaphors become unnecessary, dead-weight constraints.

Chimero advocates for evolving past these forced metaphors on two distinct fronts:

* **Evolving past visual metaphors (Skeuomorphism)**: Screens are aesthetically neutral; they do not inherently prefer flat design over stitched leather textures. For years, the design industry trapped itself in a pendulum swing between extreme skeuomorphism (apps resembling physical objects with rich wood grains and drop shadows) and extreme flat design (hyper-minimalist, stark interfaces). Chimero argues both miss the point. A native digital approach recognizes that users no longer need training wheels. Modern applications should rely on the screen's true native properties—whitespace, typography, luminosity, and subtle state changes—to communicate functionality.
* **Evolving past structural metaphors (Inside-out design)**: Historically, designers treated the web like a fixed piece of paper, drawing a boundary box and stuffing content inside. This structural skeuomorphism causes layouts to break the moment content changes dynamically. To combat this, Chimero draws inspiration from the photographic "joiner" collages of artist David Hockney. Hockney did not draw a rigid frame and try to fit a scene into it; he took dozens of overlapping photos and let the subject dictate the final, irregular shape of the collage. Chimero proposes this same inside-out approach for the web: developers must gather the actual elements first, assemble them based on their relationships, and write flexible layout rules. The content must dictate the final size and shape of the fluid container, not the other way around.

## Case study: the architectural evolution of the web

To fully grasp what it means to fight or embrace the web's grain, one must examine the architectural history of the internet. The evolution from static HTML to single-page applications (SPAs), and the recent retreat back to static generation, perfectly illustrates Chimero's theories in practice.

Phase 1: the static origins (the natural grain)
: In the early 1990s, the web operated exactly as its creators intended: as a decentralized network of interconnected text documents. Websites consisted of static HTML files served over HTTP. Interactivity was limited to hyperlinks.
: In Chimero’s framework, this era represents the purest expression of the web's grain. The browser handled routing natively, elements stacked vertically without complaint, and accessibility was built-in. However, the web was stateless. It could share information, but it could not remember user actions from one page to the next.

Phase 2: CGI and the first abstractions
: As commercial interests grew, businesses needed the web to do more than display brochures; they needed it to process transactions. This required "state"—the ability to remember that a user placed an item in a shopping cart on page A before moving to checkout on page B.
: Developers introduced the [Common Gateway Interface (CGI)](https://datatracker.ietf.org/doc/html/rfc3875) written in Perl or C, and server-side scripting languages like Perl and PHP. Instead of sending static HTML files, servers ran scripts that generated dynamic HTML on the fly. This era represents the first layer of Chimero's "padding." To make the web function as a storefront, developers abstracted the document model, introducing databases, session cookies, and dynamic templates. The web began its transition from a library of documents to an engine for applications.

Phase 3: the SPA era and the "bear on a bicycle"
: The late 2000s and 2010s marked a dramatic shift. Inspired by the smooth, app-like experiences of smartphones, developers decided that full-page browser reloads were too jarring. The industry sought to rebuild the browser inside the browser.
: Enter the era of single-page applications (SPAs) powered by JavaScript frameworks like [Angular](https://angular.dev/), [React](https://react.dev/), [Vue](https://vuejs.org/), and eventually [Svelte](https://svelte.dev/). These frameworks introduced revolutionary concepts like the Virtual DOM and two-way data binding. Instead of the server sending HTML, the server sent a massive bundle of JavaScript that hijacked the browser. The JavaScript framework intercepted link clicks, updated the URL, and manually re-rendered specific components on the screen.
: While React and Angular enabled highly complex, interactive interfaces, they represented the ultimate structural skeuomorph. Developers treated the web—a distributed document viewer—as if it were a compiled desktop operating system. This is the peak of Chimero's "bear on a bicycle." SPAs routinely broke the browser's native back button, damaged search engine optimization (SEO), and created accessibility nightmares. To fix the problems caused by this abstraction, developers built even more abstractions: client-side routers, state management libraries (like Redux), and complex build pipelines (like Webpack).
: As SPAs began to break foundational web features, the community introduced a series of compensatory APIs to bridge the gap. These workarounds—including the History API (now being superseded by the Navigation API), navigation preload, resource hints, and the Speculation Rules API—were designed to patch the structural deficiencies inherent in client-side routing. However, these "fixes" introduced significant complexity and additional layers of abstraction. The result is a web ecosystem increasingly defined by a tangled architecture of JavaScript frameworks and performance optimizations, all laboring to resolve the friction caused by fighting the browser's native grain.

Phase 4: JAMstack and the return to the grain
: By the 2020s, the industry recognized the unsustainable complexity of the SPA era. Shipping massive JavaScript bundles to render static content resulted in sluggish performance, especially on mobile devices.
: In a movement that directly echoes Chimero's plea for a "beginner's mind," the web architecture community began a retreat back to the medium's native grain. The JAMstack (JavaScript, APIs, and Markup) architecture, alongside frameworks like Astro, Next.js, and Eleventy, popularized static site generation (SSG).
: Instead of forcing the user's browser to build the webpage using JavaScript, modern frameworks build the HTML files on a server before deployment. The server sends pure, static HTML to the browser—just like the early 1990s—and only sprinkles in tiny "islands" of JavaScript where interactivity is strictly necessary. The industry realized that the mountains were, indeed, just mountains. By honoring the web's foundational document-based grain, developers achieved faster performance, better security, and a more resilient user experience.

## The hidden cost of abstraction and convenience

The evolution of web frameworks highlights a broader systemic risk. As Chimero notes, technology rarely converges or simplifies; it multiplies. "It is never this or that; it is always this and that." To manage this chaotic complexity, tech platforms offer "convenience" through heavy abstractions and automated systems.

* **The illusion of simplicity**: A user feels overwhelmed by managing separate applications for messaging, banking, shopping, and news. A technology company offers an algorithmic feed or an "everything app" to consolidate these services into one centralized dashboard, promising a simpler digital life. Similarly, a developer feels overwhelmed by managing DOM updates, so a framework like React offers an abstraction to handle the complexity automatically.
* **The cost of convenience**: This convenience acts as a Trojan Horse. By using an algorithmic platform, the user relies on a black-box system to surface relevant products or messages. The algorithm inevitably prioritizes content that benefits advertisers and maximizes engagement, rather than serving the user's chronological needs. The platform inserts itself as a mandatory middleman.

The user trades the friction of managing their own digital life for convenience, but in the process, surrenders autonomy, privacy, and control. As Chimero warns, the less you have to do, the less say you have. When we rely entirely on abstractions—whether it is a JavaScript framework managing the DOM or an algorithm managing our newsfeed—we lose the ability to steer the underlying system.

## The web as the message: a McLuhan lens

Chimero’s essays serve as a highly practical, modern extension of Marshall McLuhan’s famous 1964 aphorism, "The medium is the message." McLuhan asserted that the structural form of a medium—rather than the specific content it carries—determines its true, lasting impact on society, human behavior, and psychology. Chimero successfully maps this mid-century theory directly onto modern interface design and web architecture.

### The "grain" is the medium

McLuhan argued that society must study the medium itself to understand its effects, famously using the electric lightbulb as an example of a medium without any "content" that nonetheless completely restructures human life by allowing nighttime work and activity. Chimero introduces the concept of the "grain"—the inherent material properties of digital screens, such as fluidity, vertical stacking, and flux.

When Chimero warns against building "bicycle bear" websites or monolithic SPAs, he channels McLuhan directly. Attempting to force the web into fixed, compiled-app architectures fails because the medium of the web inherently resists rigid constraints. The web's fluidity is its message; it demands flexible, responsive structures. When designers and engineers ignore the medium's nature, the medium breaks. The screen is a lightbulb that we interact with, and its foundational message is adaptability.

### Form over content

A core tenet of McLuhan’s argument is that people focus too much on the content of a medium (the words in a book, the specific program on a television) and remain completely blind to the psychological and structural changes the medium itself imposes on their brains.

Chimero makes this exact point regarding visual aesthetics and digital behavior. He proves that screens are aesthetically neutral—a screen displays a flat illustration or a 3D rendering with equal ease. Therefore, the visual style is merely content, a distraction from the screen's true nature. The screen's actual identity—its "message"—lies in its capacity for interaction, state changes, and kinetic behavior.

For example, the "infinite scroll" or the "pull-to-refresh" gesture are structural forms of the medium. These mechanisms alter human attention spans and trigger dopamine loops entirely independently of what content the user scrolls past. Designing natively for screens means taking responsibility for how the interface behaves, rather than just decorating what it displays.

### The societal "message" of algorithmic convenience

McLuhan defined the "message" of any medium or technology as "the change of scale or pace or pattern that it introduces into human affairs." For example, the message of the automobile was not simply faster transportation, but the creation of sprawling suburbs, the decline of localized communities, and the physical restructuring of the modern city.

Chimero applies this exact macro-sociological lens in his critique of digital convenience and tech monopolies. He argues that the tech industry uses algorithmic platforms to manage the overwhelming complexity of the modern internet. While the actual content of these platforms might be harmless or even helpful (connecting with old friends, discovering a new recipe), the message of the platform is a fundamental, dangerous shift in human autonomy.

By trading friction for convenience, users surrender their decision-making power to proprietary algorithms. Society shifts from using tools that individuals wield, to living inside closed environments that manage those individuals. In McLuhan's terms, the restructuring of independence, the erosion of attention, and the introduction of omnipotent digital middlemen represent the true, inescapable "message" of modern software architecture. Chimero's ultimate warning is clear: if the industry does not recognize and respect the grain of its digital materials, developers will end up building environments that diminish human agency.

## Enabling creativity while embracing the grain

How can designers and developers follow Chimero’s and McLuhan’s principles—embracing the web’s grain and respecting the medium’s native properties—while still enabling creativity?

* **Use the web’s inherent qualities as creative constraints.** Let fluidity, responsiveness, vertical stacking, and movement inspire new layouts, interactions, and storytelling forms that wouldn’t be possible in print or fixed media.
* **Design flexible systems.** Employ CSS Grid, Flexbox, and modular components that adapt to content and context, allowing for expressive, dynamic arrangements rather than rigid templates.
* **Experiment with native web features.** Leverage animations, transitions, variable fonts, and scroll effects to create engaging experiences that feel natural to the medium.
* **Focus on meaningful interaction and user agency.** Let creativity serve clarity and usability, rather than relying on decorative effects or forced metaphors.
* **Treat constraints as prompts for innovation.** Just as poetry thrives within the rules of meter and rhyme, web design can be most creative when it works with, not against, the medium’s “grain.”

In short: true creativity on the web comes from exploring and extending what the medium does best, not from imitating other media or fighting its nature.

## Final reflections

Chimero’s essays are a masterclass in how to think deeply about digital design, not just as a technical craft, but as a philosophical and sociological practice.

We've built the web as a factory—trying, in various ways, to turn documents into compiled applications, SPAs, or progressive web apps (PWAs). Even our design systems follow that factory model: we create a fixed set of components and try to fit content into them. This is the "bicycle bear" approach: we are forcing the web into a shape it does not want to be.

But what would it mean to build the web as a garden instead? To cultivate the medium’s natural properties, rather than trying to force it into a fixed shape?

![Different Layouts from the CSS Zen Garden](https://res.cloudinary.com/dfh6ihzvj/image/upload/c_scale,w_500/f_auto,q_auto/css-zen-garden?_a=BAMAOGOd0)

[CSS Zen Garden](http://www.csszengarden.com/), was a project that invited designers to create beautiful layouts using the same HTML structure, relying solely on CSS. The project celebrated the web's grain by showing how different styles could emerge from the same underlying content. It was a powerful demonstration of how embracing the medium's properties can lead to creativity and innovation.
