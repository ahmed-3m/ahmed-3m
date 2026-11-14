<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/hero-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/hero-light.svg">
  <img src="assets/hero-light.svg" alt="Ahmed Mohammed, AI/ML Engineer, Linz, Austria. M.Sc. AI, JKU Linz." width="100%">
</picture>

I build AI systems end to end: training and evaluating models, turning LLMs into working products, and writing the tooling that keeps coding agents honest. Open to AI/ML engineer roles and available now.

[Portfolio](https://ahmed-3m.github.io/) · [LinkedIn](https://www.linkedin.com/in/ahmed-3m/) · [Hugging Face](https://huggingface.co/ahmed-3m) · [Thesis PDF](https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf) · [ORCID](https://orcid.org/0009-0004-8934-1270)

## What I do

- **Applied machine learning.** Python, PyTorch, Lightning, Diffusers, YOLOv8 and Weights & Biases, from experiment design to results that hold up across seeds.
- **LLM products.** Multi-provider routing, vector memory, scheduled jobs and evals behind a live assistant.
- **Agent tooling.** Deterministic checks and workflows for AI coding agents. I build with Claude Code and Copilot openly, and my TypeScript and web work is AI-assisted.

## Selected work

| Project | What it is |
|---|---|
| [**mergeproof**](https://github.com/ahmed-3m/mergeproof) | Decides whether a pull request written by an AI agent is safe to merge. Plain deterministic code that never calls an LLM, so the agent being judged cannot talk its way past it. |
| [**Sihem**](https://sihem-pwa.pages.dev/) | An assistant for habits and daily routines, delivered as a Telegram bot and an installable web app. Solo side project, accepted into the tech2b incubator in Linz. Code is private. |
| [**DiffusionOOD**](https://github.com/ahmed-3m/DiffusionOOD) | M.Sc. thesis code (graded 1). A conditional diffusion model with a separation loss reaches 99.03 ± 0.07% AUROC on CIFAR-10 over three seeds. |
| [**InkjetOOD**](https://github.com/ahmed-3m/InkjetOOD) | The thesis method on industrial data: YOLOv8 plus a diffusion classifier for print quality control, on PROFACTOR's public FTI_Zer0P dataset. |
| [**Elbostan Pazar bot**](https://github.com/ahmed-3m/Elbostan-Pazar-bot) | A Messenger bot that answers a real shop's customers about prices, hours and delivery. |
| [**brainstorm2idea**](https://github.com/ahmed-3m/brainstorm2idea) and [**idea2prototype**](https://github.com/ahmed-3m/idea2prototype) | Zero-dependency tools that take a fuzzy idea to a linted brief, then to a tested prototype, with any coding agent. |

<details>
<summary><strong>The thesis result in one chart</strong></summary>
<br>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/thesis-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/thesis-light.svg">
  <img src="assets/thesis-light.svg" alt="Separation loss raised mean AUROC on CIFAR-10 from 92.52% to 99.03% and cut the spread between three seeds from 11.07 to 0.07." width="100%">
</picture>

Five external benchmarks score between 90.50% and 96.97% AUROC. The ROC curves below are drawn from the audited raw scores of seed 42, where the within-CIFAR AUROC is 98.98%.

<img src="assets/ood-roc.png" alt="ROC curves for CIFAR-10 out-of-distribution detection against six comparison sets, all well above the diagonal." width="100%">

[Thesis LaTeX source](https://github.com/ahmed-3m/thesis-diffusion-ood-latex)

</details>

## Latest work

<!-- latest-work:start -->
- Nov 13, 2026: Sync records the release that first shipped each merge ([mergeproof #76](https://github.com/ahmed-3m/mergeproof/pull/76))
- Nov 13, 2026: Sync records who closed an unmerged proven PR ([mergeproof #75](https://github.com/ahmed-3m/mergeproof/pull/75))
- Nov 13, 2026: Implement RFC 005 portfolio credibility, research accuracy, and mobile usability ([ahmed-3m.github.io #205](https://github.com/ahmed-3m/ahmed-3m.github.io/pull/205))
- Nov 9, 2026: Sync llms.txt / llms-full.txt with the refreshed CV facts ([ahmed-3m.github.io #200](https://github.com/ahmed-3m/ahmed-3m.github.io/pull/200))
- Nov 9, 2026: Retry empty commit-PR association with backoff in main-guard ([mergeproof #69](https://github.com/ahmed-3m/mergeproof/pull/69))
<!-- latest-work:end -->

## Activity

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/activity-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/activity-light.svg">
  <img src="assets/activity-light.svg" alt="Bar chart of GitHub contributions per week over the last 12 months." width="100%">
</picture>
