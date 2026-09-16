---
name: design-exploration
description: Compare candidate services and technologies for a system-design decision, considering essential requirements, ecosystem fit, operational maturity, and sustainable cost.
---

# Design Exploration

Explore multiple credible approaches and recommend the 3 candidates best supported by the available evidence and stated constraints.

## Considerations

In pursuit of finding suitable candidates during design exploration, the following things -- ranked by importance -- should all heavily be considered

### 1. Matches Functional Requirements

Candidates should meet the functional requirements of the prompt. If they are unclear and this could materially change which candidates are viable or recommended, ask focused questions to gain concerete functional requirements to best explore the design space.

Additionally, exclude experimental, or established services unless the user explicitly requests emerging options. Assess maturity using available evidence such as:

- Production adoption and operating history
- Reliability record and service commitments
- Documentation and support quality
- Maintenance activity and vendor stability

Do not use popularity alone as proof of reliability.

### 2. Ecosystem Fit

Consider services that fit the existing ecosystem, but do not assume they are automatically superior. Include a strong outside alternative when one could be substantially cheaper, simpler, or better suited to the requirements.

For example, when evaluating email delivery for a system already hosted on AWS, include Amazon SES as a candidate.

### 3. Cost Effectiveness

We will be unable to integrate just about any service if it does not have a generous free tier, due to budget constraints. Prefer a cost effective candidate that can get the job done to a relatively expensive candidate that perfectly fits all the requirements, unless otherwise specified.

Also examine costs after a potential free tier is exceeded, and mention under what circumstances this would happen.

Consider:

- Free-tier limits and duration
- Expected cost at the projected usage
- Cost after exceeding the free tier
- Network, storage, messaging, and other indirect charges
- Implementation and ongoing operational effort

## Output

Provide:

1. Requirements and assumptions
2. A comparison of the 3 most viable candidates
3. Any notable candidates excluded and why
4. Conditions that would change the recommendation
