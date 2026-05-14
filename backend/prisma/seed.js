const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminHash = await bcrypt.hash('Admin@1234', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@jambotikets.co.ke' },
    update: {},
    create: {
      fullName: 'Jambo Admin',
      email: 'admin@jambotikets.co.ke',
      phone: '+254700000000',
      passwordHash: adminHash,
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('Admin created:', admin.email);

  // Create organiser user
  const organiserHash = await bcrypt.hash('Organiser@1234', 12);
  const organiser = await prisma.user.upsert({
    where: { email: 'organiser@jambotikets.co.ke' },
    update: {},
    create: {
      fullName: 'Events Kenya Ltd',
      email: 'organiser@jambotikets.co.ke',
      phone: '+254711111111',
      passwordHash: organiserHash,
      role: 'ORGANISER',
      isActive: true,
    },
  });
  console.log('Organiser created:', organiser.email);

  // Platform settings
  const settings = [
    { key: 'platform_name', value: 'Jambo Tickets' },
    { key: 'contact_email', value: 'infojambotickets@gmail.com' },
    { key: 'mpesa_shortcode', value: '174379' },
    { key: 'platform_fee_percent', value: '5' },
  ];
  for (const s of settings) {
    await prisma.platformSettings.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log('Platform settings created');

  // Sample events
  const events = [
    {
      title: 'Nairobi Jazz Festival 2025',
      slug: 'nairobi-jazz-festival-2025',
      description: '<p>Kenya\'s premier jazz festival returns to the heart of Nairobi. An electrifying evening of world-class jazz, fusion, and afrobeat performances featuring top local and international artists. Join thousands of music lovers for an unforgettable night under the stars at the iconic Uhuru Park amphitheatre.</p><p>Doors open at 5:00 PM. Come early to secure the best spots. Food and beverages available on-site.</p>',
      category: 'Music',
      venue: 'Uhuru Park Amphitheatre',
      city: 'Nairobi',
      eventDate: new Date('2025-08-15T18:00:00Z'),
      endDate: new Date('2025-08-15T23:59:00Z'),
      coverImage: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800',
      status: 'PUBLISHED',
      featured: true,
      tiers: [
        { name: 'General Admission', price: 1500, totalQuantity: 500, description: 'Standing area access' },
        { name: 'VIP Seated', price: 4500, totalQuantity: 150, description: 'Reserved seating with complimentary welcome drink' },
        { name: 'VVIP Table', price: 12000, totalQuantity: 30, description: 'Private table for 4, premium drinks package included' },
      ],
    },
    {
      title: 'Nairobi Tech Summit 2025',
      slug: 'nairobi-tech-summit-2025',
      description: '<p>East Africa\'s largest technology conference bringing together innovators, entrepreneurs, investors, and tech enthusiasts. Three days of keynote talks, workshops, product demos, and networking sessions focused on AI, fintech, agritech, and the future of work.</p><p>Speakers include founders of Africa\'s leading tech startups and international technology leaders. Limited seats available — register early.</p>',
      category: 'Corporate',
      venue: 'Sarit Expo Centre',
      city: 'Nairobi',
      eventDate: new Date('2025-09-20T08:00:00Z'),
      endDate: new Date('2025-09-22T18:00:00Z'),
      coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      status: 'PUBLISHED',
      featured: true,
      tiers: [
        { name: 'Startup Pass', price: 2500, totalQuantity: 300, description: 'Full 3-day access to talks and exhibition hall' },
        { name: 'Professional Pass', price: 7500, totalQuantity: 200, description: 'All sessions + workshops + lunch both days' },
        { name: 'Investor Pass', price: 25000, totalQuantity: 50, description: 'VIP access, private networking dinner, matchmaking sessions' },
      ],
    },
    {
      title: 'Comedy Night with Churchill',
      slug: 'comedy-night-with-churchill-2025',
      description: '<p>Kenya\'s comedy king Churchill and his squad of hilarious comedians take the stage at the KICC for one raucous night of stand-up, improv, and crowd work. Expect unfiltered Kenyan humour, celebrity roasts, and surprise guest appearances.</p><p>This is an 18+ event. Show starts at 8:00 PM sharp. Arrive early to enjoy pre-show entertainment and drinks.</p>',
      category: 'Entertainment',
      venue: 'KICC Auditorium',
      city: 'Nairobi',
      eventDate: new Date('2025-07-26T20:00:00Z'),
      endDate: new Date('2025-07-26T23:00:00Z'),
      coverImage: 'https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=800',
      status: 'PUBLISHED',
      featured: false,
      tiers: [
        { name: 'Regular', price: 1000, totalQuantity: 400, description: 'General seating' },
        { name: 'VIP Front Row', price: 3000, totalQuantity: 80, description: 'Front section reserved seats' },
      ],
    },
    {
      title: 'Lamu Cultural Festival 2025',
      slug: 'lamu-cultural-festival-2025',
      description: '<p>The world-renowned Lamu Cultural Festival celebrates the rich Swahili heritage of Kenya\'s oldest living town. Experience traditional dhow races, donkey races, cultural performances, henna art, local cuisine, and the famous Swahili fashion show along the ancient waterfront.</p><p>A UNESCO Heritage-listed celebration you must experience at least once in your lifetime.</p>',
      category: 'Entertainment',
      venue: 'Lamu Waterfront',
      city: 'Lamu',
      eventDate: new Date('2025-11-01T09:00:00Z'),
      endDate: new Date('2025-11-03T22:00:00Z'),
      coverImage: 'https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?w=800',
      status: 'PUBLISHED',
      featured: true,
      tiers: [
        { name: 'Day Pass', price: 800, totalQuantity: 600, description: 'Access for one day of your choice' },
        { name: 'Full Festival Pass', price: 2000, totalQuantity: 250, description: 'All 3 days unlimited access' },
      ],
    },
    {
      title: 'Kenya vs Ethiopia — AFCON Qualifier',
      slug: 'kenya-vs-ethiopia-afcon-qualifier-2025',
      description: '<p>The Harambee Stars take on Ethiopia in a crucial Africa Cup of Nations qualifier at the iconic Kasarani Stadium. Rally behind Kenya in what promises to be a tense, electrifying match with the national pride on the line.</p><p>Gates open at 3:00 PM. Match kicks off at 5:00 PM. All ticket holders must present a valid ID matching their ticket details at the gate.</p>',
      category: 'Sports',
      venue: 'Kasarani Stadium',
      city: 'Nairobi',
      eventDate: new Date('2025-10-10T17:00:00Z'),
      endDate: new Date('2025-10-10T19:30:00Z'),
      coverImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800',
      status: 'PUBLISHED',
      featured: false,
      tiers: [
        { name: 'Terraces', price: 200, totalQuantity: 5000, description: 'Open terrace standing area' },
        { name: 'Lower Stand', price: 500, totalQuantity: 2000, description: 'Covered lower grandstand seating' },
        { name: 'Upper VIP', price: 2000, totalQuantity: 500, description: 'Premium VIP upper stand, reserved seat' },
      ],
    },
  ];

  for (const eventData of events) {
    const { tiers, ...eventFields } = eventData;
    const event = await prisma.event.upsert({
      where: { slug: eventFields.slug },
      update: {},
      create: {
        ...eventFields,
        organiserId: organiser.id,
        ticketTiers: {
          create: tiers,
        },
      },
    });
    console.log('Event created:', event.title);
  }

  // Sample blog posts
  const blogs = [
    {
      title: '5 Must-Attend Events in Nairobi This August',
      slug: '5-must-attend-events-nairobi-august-2025',
      excerpt: 'From jazz festivals to comedy nights, August is packed with incredible events. Here\'s our curated list of the best.',
      content: '<p>August in Nairobi is one of the most vibrant months for events and entertainment. The city comes alive with music, culture, sports, and corporate gatherings that cater to every taste and budget.</p><p>In this guide, we break down the top 5 events you absolutely cannot miss this month, with everything you need to know about tickets, venues, and what to expect.</p><h2>1. Nairobi Jazz Festival</h2><p>The city\'s premier jazz gathering returns to Uhuru Park with an all-star lineup of local and international artists. Tickets start at KES 1,500.</p><h2>2. Comedy Night with Churchill</h2><p>Get your laugh muscles ready. Churchill and his crew bring the heat to KICC Auditorium for one unforgettable night.</p>',
      publishedAt: new Date('2025-07-15'),
      authorId: admin.id,
      coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
    },
    {
      title: 'How to Buy Tickets Safely Online in Kenya',
      slug: 'how-to-buy-tickets-safely-online-kenya',
      excerpt: 'With ticket fraud on the rise, here\'s everything you need to know about buying event tickets safely using M-Pesa.',
      content: '<p>Online ticket fraud is a growing problem in Kenya. With so many events being promoted on social media, it\'s increasingly difficult to tell legitimate ticket platforms from scammers.</p><p>At Jambo Tickets, we take security seriously. Every ticket sold on our platform is protected by end-to-end encryption, unique QR codes, and M-Pesa\'s secure STK Push payment system.</p><h2>Red Flags to Watch For</h2><p>Be wary of sellers asking you to send M-Pesa directly to a personal number, tickets being sold via WhatsApp with no official receipt, and prices that seem too good to be true.</p><h2>How Jambo Tickets Protects You</h2><p>Every purchase on Jambo Tickets generates a unique QR code that can only be scanned once at the gate. Your booking confirmation is sent directly to your email and phone.</p>',
      publishedAt: new Date('2025-07-01'),
      authorId: admin.id,
      coverImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800',
    },
    {
      title: 'The Rise of Corporate Events in Nairobi: Trends for 2025',
      slug: 'corporate-events-nairobi-trends-2025',
      excerpt: 'Corporate Kenya is investing more than ever in team experiences, conferences, and product launches. Here\'s what\'s driving the boom.',
      content: '<p>The corporate events sector in Kenya has seen a remarkable rebound and growth trajectory in 2025. Companies are spending more on team retreats, conferences, and brand activations than in any previous year.</p><p>Here\'s what\'s driving the trend and what it means for event organisers and attendees.</p><h2>Hybrid Events Are Here to Stay</h2><p>The pandemic permanently changed how companies think about events. Today, the most successful corporate events combine an in-person experience with a livestreamed component for remote attendees.</p>',
      publishedAt: new Date('2025-06-20'),
      authorId: admin.id,
      coverImage: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
    },
  ];

  for (const blog of blogs) {
    await prisma.blog.upsert({
      where: { slug: blog.slug },
      update: {},
      create: blog,
    });
    console.log('Blog created:', blog.title);
  }

  console.log('\nSeed completed successfully!');
  console.log('Admin login: admin@jambotikets.co.ke / Admin@1234');
  console.log('Organiser login: organiser@jambotikets.co.ke / Organiser@1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
