/**
 * Seeds the Neon database with fresh starter content for Betty & Promise Roofing
 * System — a handful of categories, published blog articles, and richer About
 * copy. Idempotent: upserts by slug, so re-running updates rather than dupes.
 *
 *   npm run db:seed
 */
import 'dotenv/config';
import { Client } from 'pg';

const AUTHOR = 'Betty & Promise Roofing System';

const CATEGORIES: { name: string; slug: string; description: string }[] = [
  { name: 'Roofing Guides', slug: 'roofing-guides', description: 'Practical guides to choosing and caring for your roof.' },
  { name: 'Product Insights', slug: 'product-insights', description: 'Deep dives into aluminium roofing sheet types and profiles.' },
  { name: 'Installation & Maintenance', slug: 'installation-maintenance', description: 'Getting your roof fitted right and keeping it that way.' },
  { name: 'Buying Tips', slug: 'buying-tips', description: 'Pricing, quality checks and how to buy with confidence.' },
];

const ARTICLES: {
  slug: string;
  title: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  keywords: string[];
  reading_minutes: number;
  content_html: string;
  categories: string[];
}[] = [
  {
    slug: 'how-to-choose-aluminium-roofing-sheets-lagos',
    title: 'How to Choose the Right Aluminium Roofing Sheets in Lagos',
    excerpt:
      'From gauge and profile to coating and colour, here is how to pick aluminium roofing sheets that last decades in the Nigerian climate.',
    meta_title: 'How to Choose Aluminium Roofing Sheets in Lagos, Nigeria',
    meta_description:
      'A practical buyer’s guide to aluminium roofing sheets in Lagos — gauge, profile, coating and colour explained so you buy the right roof once.',
    keywords: ['aluminium roofing sheets', 'roofing sheets Lagos', 'roof buying guide', 'Nigeria roofing'],
    reading_minutes: 6,
    categories: ['roofing-guides', 'buying-tips'],
    content_html: `
<p>Your roof is the single most important protection your building has against sun and rain. In Lagos and across Nigeria, aluminium roofing sheets have become the material of choice — they are lightweight, rust-proof and last for decades. But not all sheets are equal. Here is how to choose well.</p>
<h2>1. Start with the gauge (thickness)</h2>
<p>Gauge determines strength. Common aluminium roofing sheets range from 0.45mm to 0.55mm. Thicker sheets resist denting and handle strong winds better, which matters during the rainy season. For most homes we recommend at least 0.45mm; for commercial and industrial roofs, go thicker.</p>
<h2>2. Pick the right profile</h2>
<p>The profile is the shape of the sheet, and it affects both looks and performance:</p>
<ul>
<li><strong>Long-span (corrugated):</strong> economical, fast to install, ideal for large roofs.</li>
<li><strong>Step-tile:</strong> a premium tiled look with excellent water run-off.</li>
<li><strong>Stone-coated:</strong> the most decorative, with a textured finish and long warranty.</li>
</ul>
<h2>3. Check the coating and finish</h2>
<p>A quality colour coating protects the metal and keeps your roof looking new. Look for even, factory-applied finishes rather than cheap after-market paint that fades within a year.</p>
<h2>4. Match the colour to your building</h2>
<p>Lighter colours reflect more heat and keep interiors cooler — a real advantage in the Lagos sun. Darker colours look striking but absorb more heat.</p>
<h2>Buy once, buy right</h2>
<p>The cheapest sheet is rarely the best value. Speak to our team about your roof size and use, and we will recommend the right gauge, profile and colour — supplied and installed anywhere in Nigeria.</p>
`,
  },
  {
    slug: 'aluminium-vs-stone-coated-vs-long-span-roofing-nigeria',
    title: 'Aluminium vs Stone-Coated vs Long-Span: Which Roof Is Best for Nigeria?',
    excerpt:
      'Three of the most popular roofing options compared on durability, looks, cost and climate performance — so you can decide with confidence.',
    meta_title: 'Aluminium vs Stone-Coated vs Long-Span Roofing in Nigeria',
    meta_description:
      'Compare aluminium long-span, step-tile and stone-coated roofing for Nigerian homes — durability, appearance, cost and heat performance.',
    keywords: ['stone coated roofing', 'long span aluminium', 'roofing comparison Nigeria', 'step tile roof'],
    reading_minutes: 5,
    categories: ['product-insights', 'roofing-guides'],
    content_html: `
<p>“Which roof should I use?” is the question we hear most. The honest answer is that it depends on your budget, your building and the look you want. Here is a clear comparison of the three most popular options in Nigeria.</p>
<h2>Long-span aluminium</h2>
<p>The workhorse of Nigerian roofing. Long, continuous sheets mean fewer joins, quick installation and a lower cost per square metre. It is rust-proof and light, making it a great all-round choice for homes, warehouses and schools.</p>
<h2>Step-tile aluminium</h2>
<p>Step-tile gives you the elegant, segmented look of tiles with the strength and light weight of aluminium. Water runs off beautifully, and the raised profile adds rigidity. It sits between long-span and stone-coated on price.</p>
<h2>Stone-coated roofing</h2>
<p>The premium option. A layer of natural stone chips bonds to the metal for a rich, textured finish and excellent noise reduction during rain. It carries the longest warranties and lifts the value of a property — at a higher upfront cost.</p>
<h2>The bottom line</h2>
<ul>
<li><strong>Tight budget, large roof:</strong> long-span aluminium.</li>
<li><strong>Smart looks at a fair price:</strong> step-tile.</li>
<li><strong>Premium finish and longevity:</strong> stone-coated.</li>
</ul>
<p>Whichever you choose, we supply genuine, rust-proof aluminium and install it to last.</p>
`,
  },
  {
    slug: 'aluminium-roofing-sheet-prices-nigeria',
    title: 'Aluminium Roofing Sheet Prices in Nigeria: What Affects the Cost',
    excerpt:
      'Gauge, profile, coating, roof size and installation all move the price. Here is what to expect and how to get genuine value for money.',
    meta_title: 'Aluminium Roofing Sheet Prices in Nigeria — Cost Guide',
    meta_description:
      'Understand what drives aluminium roofing sheet prices in Nigeria — gauge, profile, coating and installation — and how to get real value.',
    keywords: ['aluminium roofing sheet price', 'roofing cost Nigeria', 'roof price Lagos'],
    reading_minutes: 4,
    categories: ['buying-tips'],
    content_html: `
<p>Roofing is a long-term investment, so it pays to understand what you are paying for. Aluminium roofing sheet prices in Nigeria are shaped by a few key factors.</p>
<h2>What moves the price</h2>
<ul>
<li><strong>Gauge:</strong> thicker sheets (0.55mm) cost more than thinner ones (0.45mm) but last longer.</li>
<li><strong>Profile:</strong> long-span is the most affordable; step-tile and stone-coated command a premium.</li>
<li><strong>Coating and colour:</strong> quality factory finishes add a little cost and a lot of lifespan.</li>
<li><strong>Roof size and complexity:</strong> more valleys, ridges and cuts mean more labour.</li>
<li><strong>Installation:</strong> professional fitting protects your warranty and prevents leaks.</li>
</ul>
<h2>Beware the “cheap roof” trap</h2>
<p>Very low prices usually mean thin gauge, poor coatings or inexperienced labour — and a roof that fails early. The true cost of a roof is spread over its lifetime, and a quality aluminium roof easily outlasts a cheap one twice over.</p>
<h2>Get an accurate quote</h2>
<p>Because every roof is different, the best way to know your cost is a free, no-obligation quote. Tell us your roof size and preferred profile, and we will give you a clear, itemised price.</p>
`,
  },
  {
    slug: 'signs-its-time-to-replace-your-roof',
    title: '5 Signs It’s Time to Replace Your Roof',
    excerpt:
      'Leaks, rust, sagging and rising energy bills are all warnings. Spot these five signs early and save yourself a costly emergency.',
    meta_title: '5 Signs It’s Time to Replace Your Roof — Betty & Promise',
    meta_description:
      'Five clear signs your roof needs replacing — leaks, rust, sagging, loose sheets and rising heat — and what to do about each.',
    keywords: ['roof replacement', 'roof repair Lagos', 'roof leak', 'when to replace roof'],
    reading_minutes: 4,
    categories: ['installation-maintenance', 'roofing-guides'],
    content_html: `
<p>A failing roof rarely gives up overnight — it warns you first. Catch these five signs early and you can plan a replacement on your terms rather than during a downpour.</p>
<h2>1. Persistent leaks and water stains</h2>
<p>Brown patches on ceilings or walls mean water is getting in. One leak can be repaired; recurring leaks across the roof signal it is time to replace.</p>
<h2>2. Rust and corrosion</h2>
<p>Old steel roofs rust. If you see orange streaks or flaking, the metal is failing — a rust-proof aluminium roof solves this permanently.</p>
<h2>3. Sagging or uneven lines</h2>
<p>A roofline that dips suggests the structure or fasteners underneath are giving way. This is a safety issue and should be assessed quickly.</p>
<h2>4. Loose, lifted or missing sheets</h2>
<p>Sheets that rattle in the wind or lift at the edges let in water and can blow off in a storm.</p>
<h2>5. Rising indoor heat</h2>
<p>A tired, poorly coated roof reflects less sun and traps more heat, pushing up cooling costs. A modern, light-coloured aluminium roof runs cooler.</p>
<p>Not sure where your roof stands? Book a free on-site assessment and we will give you an honest recommendation.</p>
`,
  },
  {
    slug: 'aluminium-roof-maintenance-tips-nigerian-climate',
    title: 'Aluminium Roof Maintenance Tips for the Nigerian Climate',
    excerpt:
      'Aluminium roofs are low-maintenance, not no-maintenance. A few simple habits each year keep your roof watertight and looking new for decades.',
    meta_title: 'Aluminium Roof Maintenance Tips for Nigeria’s Climate',
    meta_description:
      'Simple, seasonal aluminium roof maintenance tips for the Nigerian climate — clearing gutters, checking fasteners and rinsing off dust.',
    keywords: ['roof maintenance', 'aluminium roof care', 'roofing tips Nigeria'],
    reading_minutes: 4,
    categories: ['installation-maintenance'],
    content_html: `
<p>One of the joys of an aluminium roof is how little it asks of you. It will not rust and it shrugs off sun and rain. Still, a little care each year keeps it performing at its best.</p>
<h2>Clear gutters and valleys</h2>
<p>Leaves and dust block water flow and cause overflow during heavy rain. Clear gutters at the start and end of the rainy season.</p>
<h2>Rinse off dust and harmattan grime</h2>
<p>A gentle rinse restores the finish and lets the coating reflect heat properly. Avoid harsh abrasives that can scratch the coating.</p>
<h2>Check fasteners and flashing</h2>
<p>After strong winds, look for loose screws, lifted edges or gaps around flashing at chimneys and joins. Tightening these early prevents leaks.</p>
<h2>Trim overhanging branches</h2>
<p>Branches scrape the coating and drop debris. Keeping them trimmed protects both the finish and your gutters.</p>
<h2>Book an occasional professional inspection</h2>
<p>Every few years, a professional eye catches small issues before they grow. Our team is happy to inspect and advise — get in touch any time.</p>
`,
  },
];

const ABOUT_STATS = [
  { label: 'Roof lifespan', value: '30+ Yrs' },
  { label: 'Rust-proof aluminium', value: '100%' },
  { label: 'Delivery & install', value: 'Nationwide' },
  { label: 'On-site quotes', value: 'Free' },
];

async function main() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) throw new Error('DATABASE_URL is not set (backend/.env)');

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: /sslmode=disable/.test(DATABASE_URL) ? false : { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    // Categories --------------------------------------------------------
    const catId: Record<string, string> = {};
    for (const c of CATEGORIES) {
      const { rows } = await client.query(
        `insert into categories (name, slug, description)
           values ($1, $2, $3)
         on conflict (slug) do update set name = excluded.name, description = excluded.description
         returning id`,
        [c.name, c.slug, c.description],
      );
      catId[c.slug] = rows[0].id;
    }
    console.log(`✓ categories: ${CATEGORIES.length}`);

    // Articles ----------------------------------------------------------
    let i = 0;
    for (const a of ARTICLES) {
      // Stagger published dates a few days apart for a natural-looking blog.
      const published = new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000).toISOString();
      const { rows } = await client.query(
        `insert into articles
           (slug, title, excerpt, content_html, meta_title, meta_description,
            keywords, status, featured, author, reading_minutes, published_at)
         values ($1,$2,$3,$4,$5,$6,$7,'published',$8,$9,$10,$11)
         on conflict (slug) do update set
           title = excluded.title,
           excerpt = excluded.excerpt,
           content_html = excluded.content_html,
           meta_title = excluded.meta_title,
           meta_description = excluded.meta_description,
           keywords = excluded.keywords,
           status = 'published',
           featured = excluded.featured,
           author = excluded.author,
           reading_minutes = excluded.reading_minutes
         returning id`,
        [
          a.slug,
          a.title,
          a.excerpt,
          a.content_html.trim(),
          a.meta_title,
          a.meta_description,
          a.keywords,
          i === 0, // feature the first article
          AUTHOR,
          a.reading_minutes,
          published,
        ],
      );
      const articleId = rows[0].id;

      await client.query('delete from article_categories where article_id = $1', [articleId]);
      for (const slug of a.categories) {
        if (catId[slug]) {
          await client.query(
            'insert into article_categories (article_id, category_id) values ($1, $2) on conflict do nothing',
            [articleId, catId[slug]],
          );
        }
      }
      i++;
    }
    console.log(`✓ articles: ${ARTICLES.length}`);

    // About stats -------------------------------------------------------
    await client.query(
      `update about_content set
         subheading = 'Trusted aluminium roofing sheet supplier in Lagos, Nigeria — supply, delivery and expert installation nationwide.',
         stats = $1::jsonb
       where id = 1`,
      [JSON.stringify(ABOUT_STATS)],
    );
    console.log('✓ about content enriched');

    console.log('✓ Seed complete.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('✗ Seed failed:', err.message);
  process.exit(1);
});
