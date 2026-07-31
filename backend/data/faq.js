// Shared FAQ content. Each entry also carries a few extra `keywords` beyond
// what's in the question/answer text, to help Hari (the chat assistant)
// match loosely-worded questions to the right answer.
const faq = [
  {
    id: "what-is-hsf",
    question: "What is Hari Seva Foundation?",
    answer:
      "Hari Seva Foundation is a community-run seva (service) platform based in Bareilly, Uttar Pradesh. We run food drives, school kit distributions, and relief campaigns, connecting donors, volunteers, and food-drive partners (restaurants, temples, schools, community halls) so meals and essentials reach the families who need them.",
    keywords: ["about", "who", "foundation", "ngo", "hari seva"],
  },
  {
    id: "how-donate-money",
    question: "How do I donate money?",
    answer:
      "Go to the Donate page and choose Monetary donation. You can pay via the UPI QR code and enter your transaction ID, or use the 'Pay with Razorpay' button if it's enabled, for card/UPI/netbanking checkout. Donations made via Razorpay are verified automatically; UPI transaction IDs are verified by our admin team, usually within a day or two.",
    keywords: ["pay", "money", "upi", "razorpay", "qr", "payment", "contribute", "fund"],
  },
  {
    id: "how-donate-material",
    question: "How do I donate raw materials like rice or oil?",
    answer:
      "On the Donate page, switch to Raw material donation. Pick the campaign or food drive that needs it, choose the material and quantity, and share your name, pickup address, and a time slot you're available. Our team will arrange pickup, and once handed over, an admin verifies the donation and it's added to inventory automatically.",
    keywords: ["rice", "oil", "material", "goods", "supplies", "pickup", "groceries"],
  },
  {
    id: "how-volunteer",
    question: "How do I become a volunteer?",
    answer:
      "Register on our site and choose 'Volunteer' as your role. Once logged in, browse the Food Drives page and click 'Join as volunteer' on any upcoming drive. An admin will approve your request, and your hours and events get tracked automatically in your Volunteer Dashboard.",
    keywords: ["volunteer", "join", "help", "sign up", "hours"],
  },
  {
    id: "how-partner",
    question: "How can my restaurant/temple/school host a food drive?",
    answer:
      "Register as a Food Drive Partner. From your Partner Dashboard, submit a request with your preferred dates, capacity, and any notes about your space. Our admin team reviews it and schedules a drive at your location.",
    keywords: ["host", "venue", "restaurant", "temple", "school", "community hall", "space", "location"],
  },
  {
    id: "how-track-donation",
    question: "How do I track my donation or download a receipt?",
    answer:
      "Log in and open your Donor Dashboard. It shows your full donation history with status (pending or verified) and lets you download a receipt for anything that's been verified.",
    keywords: ["receipt", "history", "track", "status", "certificate"],
  },
  {
    id: "where-located",
    question: "Where does Hari Seva Foundation operate?",
    answer: "We're based in Bareilly, Uttar Pradesh, and run food drives and campaigns across the city and surrounding areas.",
    keywords: ["location", "city", "where", "bareilly", "area"],
  },
  {
    id: "contact-info",
    question: "How do I contact the foundation?",
    answer:
      "You can reach Rishabh Shinghal, our founder, at +91 86301 97225 or rishabhshngl121@gmail.com. There's also a contact form on our Contact page.",
    keywords: ["contact", "phone", "email", "founder", "reach", "call"],
  },
];

module.exports = faq;
