import { Megaphone, Rocket, Timer, type LucideIcon } from "lucide-react";

const steps: { title: string; body: string; aside: string; icon: LucideIcon }[] =
  [
    {
      title: "Make the promise",
      body: "Write down exactly what you'll ship and pick a deadline. One sentence. No roadmap, no sprint planning.",
      aside: "“I will ship my landing page by Friday.”",
      icon: Megaphone,
    },
    {
      title: "Share the page",
      body: "Your challenge gets a public page with a countdown. Post it wherever your people are. Now they're watching.",
      aside: "2d 14h remaining",
      icon: Timer,
    },
    {
      title: "Ship it — or don't",
      body: "Mark it shipped before time runs out. Miss the deadline and the page says so. Permanently. Publicly.",
      aside: "SHIPPED / FAILED TO SHIP",
      icon: Rocket,
    },
  ];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-title"
      className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24"
    >
      <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h2
          id="how-title"
          className="font-heading text-4xl font-black tracking-tighter sm:text-5xl"
        >
          How it works
        </h2>
        <p className="font-mono text-sm text-muted-foreground">
          three steps. zero excuses.
        </p>
      </div>

      <ol className="grid border-2 border-foreground bg-card md:grid-cols-3">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <li
              key={step.title}
              className="flex flex-col gap-4 border-foreground p-6 not-last:border-b-2 md:not-last:border-r-2 md:not-last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Icon aria-hidden="true" className="size-5" />
              </div>
              <h3 className="font-heading text-2xl font-extrabold tracking-tight">
                {step.title}
              </h3>
              <p className="text-muted-foreground">{step.body}</p>
              <p className="mt-auto border-t border-dashed border-foreground/40 pt-4 font-mono text-xs">
                {step.aside}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
