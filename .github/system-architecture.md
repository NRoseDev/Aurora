# Aurora Development Guidelines & Architecture Constraints

You are an AI programming assistant helping build Aurora. You must strictly adhere to the following ecosystem rules and architectural requirements across all generated code.

## 1. Credit Allocation System
* Baseline Tier: Implement code allowing a native baseline of 1,100 credits per month bundled into the core subscription.
* Mid-Tier (Growth): Support a secondary, larger expandable pool.
* Max Tier (Unlimited Pro): Fully uncapped logic.

## 2. Smart Refund Engine (Zero-Penalty Debugging)
* Track state execution in the terminal. If an AI-generated snippet causes a runtime or compilation error, flag that file state.
* Any consecutive debugging loops, patches, or optimization passes to resolve that specific error flag must incur exactly 0 credit deductions until execution stabilizes.

## 3. Token-Efficient GitHub Sync
* Do not resend full codebases over the API network.
* Interlock with local git diffs to isolate and calculate token usage exclusively for modified lines of code.

## 4. Authentic Creator Tools (Anti-Slop Philosophy)
* Do not generate synthetic AI avatars or fully manufactured artificial video.
* Prioritize visual lip-sync re-stitching and emotional voice cloning architectures to modify or patch real, creator-filmed video assets.
* Automate long-form to vertical 9:16 short-form video slicing using audio hooks and face-centered smart tracking.
* Integrate multi-language video/audio dubbing pipelines that automatically translate content while preserving the original speaker's voice tone, pacing, and multi-speaker dynamics.

## 5. Soul Echoes Collective Infrastructure
* Embed an inline, automated NDA framework and digital timestamp watermarking whenever raw concepts are introduced in the Collective.
* Support metric and portfolio cross-syncing natively into user Collective profiles.
