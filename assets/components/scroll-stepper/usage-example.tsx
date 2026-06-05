import ScrollStepper from "./ScrollStepper";

/**
 * The stepper IS a full-height scroll region. Place it in normal page flow
 * between other sections — do NOT put it inside a fixed-height box, it needs
 * the page to scroll through it.
 */
export default function StepperExample() {
  return (
    <>
      <section style={{ minHeight: "100vh" }}>{/* hero / content above */}</section>

      <ScrollStepper
        steps={3}
        renderPanel={(step, fill) => (
          <div style={{ textAlign: "center", maxWidth: 480 }}>
            {step === 0 && <h2>Find compatible partners</h2>}
            {step === 1 && <h2>Compare on cultural fit</h2>}
            {step === 2 && <h2>Connect with confidence</h2>}
            <p style={{ color: "#64748B" }}>
              Step {step + 1} of 3 · {Math.round(fill * 100)}%
            </p>
          </div>
        )}
      />

      <section style={{ minHeight: "100vh" }}>{/* content below */}</section>
    </>
  );
}

// Minimal form (indicator only, no panel content):
// <ScrollStepper steps={3} />
