import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import { Card, Badge, Button, Loader, ProgressBar } from "../components/ui";
import ThaliDivider from "../components/ThaliDivider";

const statusTone = { active: "success", upcoming: "warning", completed: "default" };

export default function CampaignDetail() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api
      .get(`/campaigns/${id}`)
      .then(setCampaign)
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold">Campaign not found</h1>
        <p className="text-[var(--color-ink-soft)] mt-3">It may have been removed or the link is incorrect.</p>
        <Link to="/campaigns" className="inline-block mt-6"><Button>Back to campaigns</Button></Link>
      </div>
    );
  }

  if (!campaign) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto px-5 py-16">
      <Badge tone={statusTone[campaign.status]}>{campaign.status}</Badge>
      <h1 className="font-display text-4xl md:text-5xl font-semibold mt-4">{campaign.name}</h1>
      <p className="text-sm text-[var(--color-ink-soft)] mt-2">
        📍 {campaign.location} &middot; {new Date(campaign.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} &ndash; {new Date(campaign.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
      </p>
      <p className="text-lg text-[var(--color-ink-soft)] mt-6 leading-relaxed">{campaign.description}</p>

      <ThaliDivider label="Funding Progress" />

      <Card className="p-6 mt-6">
        <div className="flex justify-between text-sm font-mono-num mb-2">
          <span className="text-lg font-semibold text-[var(--color-maroon)]">₹{campaign.raisedAmount.toLocaleString("en-IN")} raised</span>
          <span className="text-[var(--color-ink-soft)]">Goal: ₹{campaign.targetAmount.toLocaleString("en-IN")}</span>
        </div>
        <ProgressBar value={campaign.raisedAmount} max={campaign.targetAmount} />
        <Link to={`/donate?campaign=${campaign.id}`} className="inline-block mt-5">
          <Button>Donate to this campaign</Button>
        </Link>
      </Card>

      {campaign.requiredMaterials?.length > 0 && (
        <>
          <ThaliDivider label="Material Requirements" />
          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            {campaign.requiredMaterials.map((m) => (
              <Card key={m.item} className="p-5">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-display text-lg font-semibold">{m.item}</h4>
                  <span className="text-xs font-mono-num text-[var(--color-ink-soft)]">
                    {m.received}/{m.required} {m.unit}
                  </span>
                </div>
                <div className="mt-2"><ProgressBar value={m.received} max={m.required} colorVar="--color-leaf" /></div>
                <p className="text-xs text-[var(--color-ink-soft)] mt-2">
                  {Math.max(0, m.required - m.received)} {m.unit} still needed
                </p>
              </Card>
            ))}
          </div>
          <Link to={`/donate?campaign=${campaign.id}&type=material`} className="inline-block mt-6">
            <Button variant="ghost">Donate raw materials</Button>
          </Link>
        </>
      )}
    </div>
  );
}
