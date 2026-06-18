import { CalendarClock, Pencil, Plus } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent } from "@/components/ui/card";
import { requireTenantDb } from "@/lib/tenant/context";
import {
  AppointmentFormDialog,
  type AppointmentFormValues,
} from "@/components/appointments/appointment-form-dialog";
import { DeleteAppointmentButton } from "@/components/appointments/delete-appointment-button";
import { PH_LOCALE, PH_TIMEZONE, formatTime, toDateTimeLocalManila } from "@/lib/format";

const toLocalInput = toDateTimeLocalManila;

const timeRange = (start: Date, end: Date) => {
  const date = start.toLocaleDateString(PH_LOCALE, {
    timeZone: PH_TIMEZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return `${date} · ${formatTime(start)} – ${formatTime(end)}`;
};

type Row = {
  id: string;
  title: string | null;
  startTime: Date;
  endTime: Date;
  notes: string | null;
  clientId: string | null;
  client: { name: string } | null;
};

function AppointmentRow({ appt, clients }: { appt: Row; clients: { id: string; name: string }[] }) {
  const label = appt.title ?? appt.client?.name ?? "Appointment";
  const formValues: AppointmentFormValues = {
    id: appt.id,
    title: appt.title,
    clientId: appt.clientId,
    startTime: toLocalInput(appt.startTime),
    endTime: toLocalInput(appt.endTime),
    notes: appt.notes,
  };

  return (
    <div className="border-border/60 flex items-start justify-between gap-3 border-b px-4 py-3 last:border-0">
      <div className="min-w-0">
        <p className="font-medium">{label}</p>
        <p className="text-muted-foreground text-sm">{timeRange(appt.startTime, appt.endTime)}</p>
        {appt.client && appt.title && (
          <p className="text-muted-foreground text-xs">{appt.client.name}</p>
        )}
        {appt.notes && <p className="text-muted-foreground mt-1 text-sm">{appt.notes}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <AppointmentFormDialog
          mode="edit"
          appointment={formValues}
          clients={clients}
          triggerVariant="ghost"
          triggerSize="icon-xs"
          triggerAriaLabel="Edit appointment"
          triggerChildren={<Pencil className="text-muted-foreground size-3.5" />}
        />
        <DeleteAppointmentButton appointmentId={appt.id} label={label} />
      </div>
    </div>
  );
}

// Load appointments split into upcoming/past. Kept out of the component body so
// the current-time read (impure) isn't flagged by the react-hooks purity rule.
async function loadAppointments(db: Awaited<ReturnType<typeof requireTenantDb>>["db"]) {
  const [appointments, clients] = await Promise.all([
    db.appointment.findMany({
      orderBy: { startTime: "asc" },
      include: { client: { select: { name: true } } },
    }),
    db.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const now = Date.now();
  const upcoming = appointments.filter((a) => a.endTime.getTime() >= now);
  const past = appointments
    .filter((a) => a.endTime.getTime() < now)
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

  return { appointments, clients, upcoming, past };
}

export default async function AppointmentsPage() {
  const { db } = await requireTenantDb();
  const { appointments, clients, upcoming, past } = await loadAppointments(db);

  return (
    <>
      <DashboardHeader title="Appointments" />
      <main className="flex-1 px-4 py-8 md:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-muted-foreground text-sm">Schedule and track client meetings.</p>
          <AppointmentFormDialog
            mode="create"
            clients={clients}
            triggerSize="sm"
            triggerChildren={
              <>
                <Plus className="size-4" />
                New appointment
              </>
            }
          />
        </div>

        {appointments.length === 0 ? (
          <div className="border-border/60 flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
            <span className="bg-muted text-muted-foreground mb-4 flex size-12 items-center justify-center rounded-full">
              <CalendarClock className="size-6" />
            </span>
            <h3 className="text-lg font-semibold">No appointments yet</h3>
            <p className="text-muted-foreground mt-1 mb-6 max-w-sm text-sm">
              Schedule your first meeting to keep client time organized.
            </p>
            <AppointmentFormDialog
              mode="create"
              clients={clients}
              triggerSize="sm"
              triggerChildren={
                <>
                  <Plus className="size-4" />
                  New appointment
                </>
              }
            />
          </div>
        ) : (
          <div className="space-y-8">
            <section>
              <h2 className="mb-3 text-sm font-semibold">Upcoming</h2>
              {upcoming.length === 0 ? (
                <p className="text-muted-foreground text-sm">No upcoming appointments.</p>
              ) : (
                <Card className="border-border/60">
                  <CardContent className="p-0">
                    {upcoming.map((appt) => (
                      <AppointmentRow key={appt.id} appt={appt} clients={clients} />
                    ))}
                  </CardContent>
                </Card>
              )}
            </section>

            {past.length > 0 && (
              <section>
                <h2 className="text-muted-foreground mb-3 text-sm font-semibold">Past</h2>
                <Card className="border-border/60 opacity-75">
                  <CardContent className="p-0">
                    {past.map((appt) => (
                      <AppointmentRow key={appt.id} appt={appt} clients={clients} />
                    ))}
                  </CardContent>
                </Card>
              </section>
            )}
          </div>
        )}
      </main>
    </>
  );
}
