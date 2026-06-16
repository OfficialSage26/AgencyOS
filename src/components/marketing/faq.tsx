import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Who is AgencyOS for?",
    answer:
      "Freelancers, web and marketing agencies, consultants, virtual assistants, and any small service business that wants to manage clients, projects, and invoicing in one place.",
  },
  {
    question: "Do I need a credit card to start?",
    answer:
      "No. The Free plan is available forever with no credit card required. Upgrade only when you need unlimited clients, projects, or AI features.",
  },
  {
    question: "Is my data isolated from other companies?",
    answer:
      "Yes. AgencyOS is multi-tenant by design — each organization's data is strictly isolated, so no company can ever access another company's clients, projects, or invoices.",
  },
  {
    question: "What can the AI features do?",
    answer:
      "AgencyOS can generate professional proposals, contract drafts, follow-up messages, and meeting summaries from a few inputs, so you spend less time writing and more time delivering.",
  },
  {
    question: "Can I give my clients access?",
    answer:
      "Yes. The client portal gives each client their own dashboard to view project progress, download files, see invoices, and message you directly.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="border-border/60 bg-muted/30 border-t">
      <div className="mx-auto max-w-3xl px-4 py-24">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
        </div>
        <Accordion multiple={false} className="mt-12 w-full">
          {faqs.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question}>
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
