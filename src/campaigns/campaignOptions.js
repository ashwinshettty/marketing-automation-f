export const objectiveOptions = [
  { value: 'awareness', label: 'Awareness', icon: 'megaphone', description: 'Reach people likely to remember your brand.' },
  { value: 'traffic', label: 'Traffic', icon: 'cursor', description: 'Drive people to your website, app, or messages.' },
  { value: 'engagement', label: 'Engagement', icon: 'chat', description: 'Get more messages, follows, or post interactions.' },
  { value: 'leads', label: 'Leads', icon: 'funnel', description: 'Collect leads through forms, chats, or calls.' },
  { value: 'app_promotion', label: 'App promotion', icon: 'people', description: 'Encourage installs and in-app actions.' },
  { value: 'sales', label: 'Sales', icon: 'bag', description: 'Drive conversions, catalog sales, or purchases.' },
];

export const buyingTypeOptions = [
  {
    value: 'auction',
    label: 'Auction',
    description: 'Buy in real time with cost-effective bidding.',
  },
  {
    value: 'reservation',
    label: 'Reservation',
    description: 'Buy in advance for more predictable outcomes.',
  },
];

export const bidStrategyOptions = [
  {
    value: 'highest_volume',
    label: 'Highest volume or value',
    shortLabel: 'Highest volume',
    description: 'Get the most results or conversion value for your budget.',
  },
  {
    value: 'cost_per_result',
    label: 'Cost per result goal',
    shortLabel: 'Cost per result goal',
    description: 'Aim for a certain cost per result while maximising the volume of results.',
  },
  {
    value: 'roas_goal',
    label: 'ROAS goal',
    shortLabel: 'ROAS goal',
    description: 'Aim for a certain return on ad spend with flexibility to match your goals.',
  },
  {
    value: 'bid_cap',
    label: 'Bid cap',
    shortLabel: 'Bid cap',
    description: 'Set a maximum bid across auctions.',
  },
];

export const budgetStrategyOptions = [
  {
    value: 'campaign',
    label: 'Campaign budget',
    description:
      'Automatically distribute your budget to the best opportunities across your campaign. Also known as Advantage+ campaign budget.',
  },
  {
    value: 'ad_set',
    label: 'Ad set budget',
    description: 'Set different bid strategies or budget schedules for each ad set.',
  },
];

export const budgetTypeOptions = [
  { value: 'daily', label: 'Daily budget' },
  { value: 'lifetime', label: 'Lifetime budget' },
];

export const adSchedulingModeOptions = [
  {
    value: 'all_time',
    label: 'Run ads all the time',
    description: 'Ads can run at any time within your start and end dates.',
  },
  {
    value: 'schedule',
    label: 'Run ads on a schedule',
    description: 'Choose the days and times when your ads can run. Times use your ad account time zone.',
  },
];

export const adScheduleDayOptions = [
  { value: 'mon', label: 'Mon' },
  { value: 'tue', label: 'Tue' },
  { value: 'wed', label: 'Wed' },
  { value: 'thu', label: 'Thu' },
  { value: 'fri', label: 'Fri' },
  { value: 'sat', label: 'Sat' },
  { value: 'sun', label: 'Sun' },
];

export const hourOptions = Array.from({ length: 24 }, (_, h) => ({
  value: String(h).padStart(2, '0'),
  label: `${String(h).padStart(2, '0')}:00`,
}));

/** Meta Ads Manager — Leads objective conversion locations (official Help Center + Ads Manager UI). */
export const leadsConversionLocationGroups = [
  {
    id: 'multiple',
    label: 'Multiple',
    description: "Send people where they're most likely to convert.",
    options: [
      { value: 'website_and_forms', label: 'Website and instant forms' },
      { value: 'website_and_calls', label: 'Website and calls' },
      { value: 'forms_and_messenger', label: 'Instant forms and Messenger' },
    ],
  },
  {
    id: 'single',
    label: 'Single',
    description: 'Send people to one location where you want them to convert.',
    options: [
      { value: 'instagram_live', label: 'Instagram live video' },
      { value: 'website', label: 'Website' },
      { value: 'instant_forms', label: 'Instant forms' },
      { value: 'messenger', label: 'Messenger' },
      { value: 'instagram', label: 'Instagram' },
      { value: 'whatsapp', label: 'WhatsApp' },
      { value: 'calls', label: 'Calls' },
      { value: 'app', label: 'App' },
    ],
  },
];

/** Meta Ads Manager — Sales objective conversion locations. */
export const salesConversionLocationGroups = [
  {
    id: 'multiple',
    label: 'Multiple',
    description: "Send people where they're most likely to convert.",
    options: [
      { value: 'website_and_app', label: 'Website and app' },
      { value: 'website_and_store', label: 'Website and shop' },
      { value: 'website_and_calls', label: 'Website and calls' },
    ],
  },
  {
    id: 'single',
    label: 'Single',
    description: 'Send people to one location where you want them to convert.',
    options: [
      { value: 'website', label: 'Website' },
      { value: 'app', label: 'App' },
      { value: 'messenger', label: 'Messenger' },
      { value: 'whatsapp', label: 'WhatsApp' },
    ],
  },
];

export const conversionLocationGroupsByObjective = {
  leads: leadsConversionLocationGroups,
  sales: salesConversionLocationGroups,
  traffic: [
    {
      id: 'single',
      label: 'Conversion location',
      description: 'Choose where you want to drive traffic.',
      options: [
        { value: 'website', label: 'Website' },
        { value: 'app', label: 'App' },
        { value: 'messenger', label: 'Messenger' },
        { value: 'whatsapp', label: 'WhatsApp' },
        { value: 'calls', label: 'Calls' },
        { value: 'instagram_profile', label: 'Instagram profile' },
      ],
    },
  ],
  engagement: [
    {
      id: 'single',
      label: 'Conversion location',
      description: 'Choose where you want people to engage.',
      options: [
        { value: 'on_ad', label: 'On your ad' },
        { value: 'messaging_apps', label: 'Messaging apps' },
        { value: 'website', label: 'Website' },
        { value: 'app', label: 'App' },
        { value: 'facebook_page', label: 'Facebook Page' },
      ],
    },
  ],
  awareness: [
    {
      id: 'single',
      label: 'Conversion location',
      description: 'Awareness ads are shown on your ad. No location selection required.',
      options: [{ value: 'on_ad', label: 'On your ad' }],
    },
  ],
  app_promotion: [
    {
      id: 'single',
      label: 'Conversion location',
      description: 'App is selected automatically for app promotion campaigns.',
      options: [{ value: 'app', label: 'App' }],
    },
  ],
};

export const getConversionLocationGroups = (objective = 'leads') =>
  conversionLocationGroupsByObjective[objective] || leadsConversionLocationGroups;

/** @deprecated Prefer getConversionLocationGroups(objective) — defaults to Leads. */
export const conversionLocationGroups = leadsConversionLocationGroups;

export const conversionLocationOptions = Object.values(conversionLocationGroupsByObjective)
  .flat()
  .flatMap((g) => g.options)
  .filter((opt, i, arr) => arr.findIndex((o) => o.value === opt.value) === i);

/** Defaults applied when a conversion location is selected (Leads objective, Meta Ads Manager). */
export const conversionLocationDefaults = {
  website_and_forms: { performanceGoal: 'maximize_leads' },
  website_and_calls: { performanceGoal: 'maximize_conversions' },
  forms_and_messenger: { performanceGoal: 'maximize_leads' },
  instagram_live: {
    performanceGoal: 'maximize_conversions',
    facebookPage: 'inkstall_educare',
    liveVideoInstagram: 'inkstall_educare',
    liveVideoAdType: 'upcoming',
  },
  website: { performanceGoal: 'maximize_conversions' },
  instant_forms: { performanceGoal: 'maximize_leads' },
  messenger: { performanceGoal: 'maximize_leads' },
  instagram: { performanceGoal: 'maximize_leads' },
  whatsapp: { performanceGoal: 'maximize_leads' },
  calls: { performanceGoal: 'maximize_leads' },
  app: { performanceGoal: 'maximize_conversions' },
};

/** Labels match Meta Ads Manager (en-GB): "Maximise …" */
export const performanceGoalOptions = [
  { value: 'maximize_conversions', label: 'Maximise number of conversions' },
  { value: 'maximize_leads', label: 'Maximise number of leads' },
  { value: 'maximize_quality', label: 'Maximise number of quality leads' },
  { value: 'maximize_value', label: 'Maximise value of conversions' },
  { value: 'link_clicks', label: 'Maximise number of link clicks' },
  { value: 'landing_page_views', label: 'Maximise number of landing page views' },
];

/** Performance goals commonly shown for Instagram live video (Leads). */
export const instagramLivePerformanceGoalOptions = [
  { value: 'maximize_conversions', label: 'Maximise number of conversions' },
  { value: 'link_clicks', label: 'Maximise number of link clicks' },
  { value: 'landing_page_views', label: 'Maximise number of landing page views' },
];

export const instagramLiveProfileOptions = [
  {
    value: 'inkstall_educare',
    label: 'Instagram',
    handle: 'inkstall_educare',
    avatarColor: '#F5A623',
    avatarInitials: 'IE',
  },
  {
    value: 'beacot',
    label: 'Instagram',
    handle: 'beacot',
    avatarColor: '#0A66C2',
    avatarInitials: 'B',
  },
];

export const facebookPageOptions = [
  {
    value: 'inkstall_educare',
    label: 'Inkstall Educare',
    pageId: '1418438818229149',
    group: 'personal',
    avatarColor: '#000080',
    avatarInitials: 'IE',
  },
  {
    value: 'beacot',
    label: 'Beacot',
    pageId: '110027887897078',
    group: 'personal',
    avatarColor: '#0A66C2',
    avatarInitials: 'B',
  },
  {
    value: 'blicz',
    label: 'Blicz',
    pageId: '1029384756102837',
    group: 'personal',
    avatarColor: '#E1306C',
    avatarInitials: 'Bl',
  },
  {
    value: 'inkstall',
    label: 'Inkstall',
    pageId: '1987654321098765',
    group: 'personal',
    avatarColor: '#F5A623',
    avatarInitials: 'In',
  },
];

export const conversionEventOptions = [
  { value: 'complete_registration', label: 'Complete registration', group: 'inactive', available: true },
  { value: 'contact', label: 'Contact', group: 'inactive', available: true },
  { value: 'find_location', label: 'Find location', group: 'inactive', available: true },
  { value: 'lead', label: 'Lead', group: 'inactive', available: true },
  { value: 'schedule', label: 'Schedule', group: 'inactive', available: true },
  { value: 'search', label: 'Search', group: 'inactive', available: true },
  { value: 'start_trial', label: 'Start trial', group: 'inactive', available: true },
  { value: 'submit_application', label: 'Submit application', group: 'inactive', available: true },
  { value: 'subscribe', label: 'Subscribe', group: 'inactive', available: true },
  {
    value: 'view_content',
    label: 'View content',
    group: 'inactive',
    available: false,
    disabledReason: 'This conversion event is only available with the sales objective.',
  },
  {
    value: 'add_payment_info',
    label: 'Add payment info',
    group: 'inactive',
    available: false,
    disabledReason: 'This conversion event is only available with the sales objective.',
  },
  {
    value: 'add_to_cart',
    label: 'Add to cart',
    group: 'inactive',
    available: false,
    disabledReason: 'This conversion event is only available with the sales objective.',
  },
  {
    value: 'add_to_wishlist',
    label: 'Add to wishlist',
    group: 'inactive',
    available: false,
    disabledReason: 'This conversion event is only available with the sales objective.',
  },
  {
    value: 'customise_product',
    label: 'Customise product',
    group: 'inactive',
    available: false,
    disabledReason: 'This conversion event is only available with the engagement objective.',
  },
  {
    value: 'donate',
    label: 'Donate',
    group: 'inactive',
    available: false,
    disabledReason: 'This conversion event is only available with the sales objective.',
  },
  {
    value: 'initiate_checkout',
    label: 'Initiate checkout',
    group: 'inactive',
    available: false,
    disabledReason: 'This conversion event is only available with the sales objective.',
  },
  {
    value: 'purchase',
    label: 'Purchase',
    group: 'inactive',
    available: false,
    disabledReason: 'This conversion event is only available with the sales objective.',
  },
];

export const datasetOptions = [
  {
    value: 'ashwin_pixel',
    label: "Ashwin Shetty's Pixel",
    datasetId: '643033979447157',
    status: 'inactive',
  },
  {
    value: 'inkstall_pixel',
    label: 'Inkstall Pixel',
    datasetId: '512849301726448',
    status: 'inactive',
  },
];

export const genderOptions = [
  { value: 'all', label: 'All genders' },
  { value: 'women', label: 'Women' },
  { value: 'men', label: 'Men' },
];

export const languageOptions = [
  { value: 'en', label: 'English (All)' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ta', label: 'Tamil' },
  { value: 'te', label: 'Telugu' },
  { value: 'bn', label: 'Bengali' },
  { value: 'mr', label: 'Marathi' },
  { value: 'gu', label: 'Gujarati' },
  { value: 'kn', label: 'Kannada' },
  { value: 'ml', label: 'Malayalam' },
];

export const ageMinControlOptions = [
  { value: '13', label: '13+' },
  { value: '15', label: '15+' },
  { value: '18', label: '18+' },
  { value: '21', label: '21+' },
  { value: '25', label: '25+' },
];

export const locationSuggestionOptions = [
  { value: 'india', label: 'India', type: 'Country' },
  { value: 'mumbai', label: 'Mumbai, Maharashtra, India', type: 'City' },
  { value: 'delhi', label: 'Delhi, India', type: 'City' },
  { value: 'bengaluru', label: 'Bengaluru, Karnataka, India', type: 'City' },
  { value: 'hyderabad', label: 'Hyderabad, Telangana, India', type: 'City' },
  { value: 'chennai', label: 'Chennai, Tamil Nadu, India', type: 'City' },
  { value: 'pune', label: 'Pune, Maharashtra, India', type: 'City' },
  { value: 'kolkata', label: 'Kolkata, West Bengal, India', type: 'City' },
];

export const savedAudienceOptions = [
  { value: '', label: 'Search saved audiences' },
  { value: 'india_parents', label: 'India parents 25-45' },
  { value: 'school_leads', label: 'School enquiry lookalike' },
  { value: 'website_visitors', label: 'Website visitors — 180 days' },
];

export const customAudienceOptions = [
  { value: 'website_visitors_180', label: 'Website visitors — 180 days' },
  { value: 'page_engaged', label: 'Page engaged — 365 days' },
  { value: 'video_viewers', label: 'Video viewers — 50% — 365 days' },
  { value: 'customer_list', label: 'Customer list — CRM' },
  { value: 'lookalike_1', label: '1% lookalike — India' },
];

/** Sample detailed targeting (demographics, interests, behaviours) for Meta-style picker. */
export const detailedTargetingGroups = [
  {
    id: 'demographics',
    label: 'Demographics',
    options: [
      { value: 'parents', label: 'Parents', category: 'Demographics' },
      { value: 'newlyweds', label: 'Newlywed (1 year)', category: 'Demographics' },
      { value: 'education_level', label: 'Education level', category: 'Demographics' },
      { value: 'relationship_single', label: 'Single', category: 'Demographics' },
    ],
  },
  {
    id: 'interests',
    label: 'Interests',
    options: [
      { value: 'education', label: 'Education', category: 'Interests' },
      { value: 'higher_education', label: 'Higher education', category: 'Interests' },
      { value: 'online_education', label: 'Online education', category: 'Interests' },
      { value: 'parenting', label: 'Parenting', category: 'Interests' },
      { value: 'family_parenting', label: 'Family and relationships', category: 'Interests' },
    ],
  },
  {
    id: 'behaviours',
    label: 'Behaviours',
    options: [
      { value: 'engaged_shoppers', label: 'Engaged shoppers', category: 'Behaviours' },
      { value: 'facebook_access_mobile', label: 'Facebook access (mobile): all mobile devices', category: 'Behaviours' },
      { value: 'expats', label: 'Expats', category: 'Behaviours' },
    ],
  },
];

export const detailedTargetingOptions = detailedTargetingGroups.flatMap((g) => g.options);

/**
 * Meta Ads Manager placement categories
 * @see https://www.facebook.com/business/help/407108559393196
 */
export const placementGroups = [
  {
    id: 'feeds',
    label: 'Feeds',
    description: 'Ads in home feeds and related surfaces people scroll through.',
    options: [
      { value: 'facebook_feed', label: 'Facebook Feed', platform: 'facebook' },
      { value: 'facebook_profile_feed', label: 'Facebook profile feed', platform: 'facebook' },
      { value: 'facebook_marketplace', label: 'Facebook Marketplace', platform: 'facebook' },
      { value: 'facebook_right_column', label: 'Facebook right column', platform: 'facebook', desktopOnly: true },
      { value: 'facebook_notifications', label: 'Facebook notifications', platform: 'facebook' },
      { value: 'instagram_feed', label: 'Instagram Feed', platform: 'instagram' },
      { value: 'instagram_profile_feed', label: 'Instagram profile feed', platform: 'instagram' },
      { value: 'instagram_explore', label: 'Instagram Explore', platform: 'instagram' },
      { value: 'threads_feed', label: 'Threads feed', platform: 'threads' },
    ],
  },
  {
    id: 'stories_reels',
    label: 'Stories, status and Reels',
    description: 'Full-screen vertical placements people tap through.',
    options: [
      { value: 'facebook_stories', label: 'Facebook Stories', platform: 'facebook' },
      { value: 'instagram_stories', label: 'Instagram Stories', platform: 'instagram' },
      { value: 'messenger_stories', label: 'Messenger Stories', platform: 'messenger' },
      { value: 'facebook_reels', label: 'Facebook Reels', platform: 'facebook' },
      { value: 'instagram_reels', label: 'Instagram Reels', platform: 'instagram' },
      { value: 'whatsapp_status', label: 'WhatsApp Status', platform: 'whatsapp' },
    ],
  },
  {
    id: 'instream',
    label: 'In-stream ads for Reels',
    description: 'Ads that appear while people watch Reels and partner video.',
    options: [
      { value: 'facebook_reels_instream', label: 'Facebook in-stream Reels', platform: 'facebook' },
      { value: 'facebook_reels_overlay', label: 'Ads on Facebook Reels', platform: 'facebook' },
    ],
  },
  {
    id: 'search',
    label: 'Search results',
    description: 'Ads next to search results on Facebook and Instagram.',
    options: [
      { value: 'facebook_search', label: 'Facebook search results', platform: 'facebook' },
      { value: 'instagram_search', label: 'Instagram search results', platform: 'instagram' },
    ],
  },
  {
    id: 'messages',
    label: 'Messages',
    description: 'Ads in messaging destinations.',
    options: [
      { value: 'messenger_inbox', label: 'Messenger Inbox', platform: 'messenger' },
      { value: 'instagram_messages', label: 'Instagram messages', platform: 'instagram' },
      { value: 'whatsapp_messages', label: 'WhatsApp messages', platform: 'whatsapp' },
    ],
  },
  {
    id: 'apps_sites',
    label: 'Apps and sites',
    description: 'Audience Network placements across apps and sites.',
    options: [
      {
        value: 'audience_network_native',
        label: 'Audience Network native, banner and interstitial',
        platform: 'audience_network',
      },
      {
        value: 'audience_network_rewarded',
        label: 'Audience Network rewarded videos',
        platform: 'audience_network',
      },
    ],
  },
];

export const placementOptions = placementGroups.flatMap((g) => g.options);

export const allPlacementValues = placementOptions.map((o) => o.value);

export const platformOptions = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'messenger', label: 'Messenger' },
  { value: 'audience_network', label: 'Audience Network' },
  { value: 'threads', label: 'Threads' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

export const deviceOptions = [
  { value: 'mobile', label: 'Mobile' },
  { value: 'desktop', label: 'Desktop' },
];

/** Default Advantage+ placement set for Leads objective. */
export const defaultLeadsPlacements = [
  'facebook_feed',
  'facebook_marketplace',
  'instagram_feed',
  'instagram_explore',
  'threads_feed',
  'facebook_stories',
  'instagram_stories',
  'facebook_reels',
  'instagram_reels',
  'messenger_inbox',
  'audience_network_native',
];

export const defaultLeadsPlatforms = ['facebook', 'instagram', 'messenger', 'audience_network', 'threads'];

export const getPlacementsForPlatforms = (platforms = []) =>
  placementOptions.filter((p) => platforms.includes(p.platform)).map((p) => p.value);

export const adFormatOptions = [
  { value: 'single', label: 'Single image or video' },
  { value: 'carousel', label: 'Carousel' },
  { value: 'collection', label: 'Collection' },
  { value: 'instant_experience', label: 'Instant Experience' },
];

/** Formats available by conversion location (Leads objective — Meta Ads Manager). */
export const getAdFormatsForConversionLocation = (conversionLocation) => {
  const websiteLike = ['website', 'website_and_forms', 'website_and_calls', 'app'].includes(
    conversionLocation
  );
  if (conversionLocation === 'instagram_live') {
    return adFormatOptions.filter((o) => o.value === 'single');
  }
  if (websiteLike) {
    return adFormatOptions;
  }
  // Instant forms, messaging, calls — image, video, carousel only
  return adFormatOptions.filter((o) => o.value === 'single' || o.value === 'carousel');
};

export const callToActionOptions = [
  { value: 'learn_more', label: 'Learn More' },
  { value: 'sign_up', label: 'Sign Up' },
  { value: 'apply_now', label: 'Apply Now' },
  { value: 'contact_us', label: 'Contact Us' },
  { value: 'send_message', label: 'Send Message' },
  { value: 'get_quote', label: 'Get Quote' },
  { value: 'subscribe', label: 'Subscribe' },
  { value: 'book_now', label: 'Book Now' },
  { value: 'call_now', label: 'Call Now' },
  { value: 'watch_more', label: 'Watch More' },
  { value: 'get_directions', label: 'Get Directions' },
];

export const getCallToActionsForConversionLocation = (conversionLocation) => {
  if (conversionLocation === 'calls') {
    return callToActionOptions.filter((o) =>
      ['call_now', 'learn_more', 'contact_us'].includes(o.value)
    );
  }
  if (['messenger', 'instagram', 'whatsapp', 'forms_and_messenger'].includes(conversionLocation)) {
    return callToActionOptions.filter((o) =>
      ['send_message', 'sign_up', 'learn_more', 'get_quote', 'apply_now'].includes(o.value)
    );
  }
  if (conversionLocation === 'instagram_live') {
    return callToActionOptions.filter((o) =>
      ['watch_more', 'learn_more', 'sign_up', 'apply_now'].includes(o.value)
    );
  }
  if (['instant_forms', 'website_and_forms'].includes(conversionLocation)) {
    return callToActionOptions.filter((o) =>
      ['sign_up', 'apply_now', 'learn_more', 'get_quote', 'subscribe', 'contact_us'].includes(o.value)
    );
  }
  return callToActionOptions.filter((o) => o.value !== 'call_now' && o.value !== 'watch_more');
};

export const messageTemplateOptions = [
  { value: 'start_conversation', label: 'Start conversations', description: 'Icebreakers and FAQs' },
  { value: 'automated_chat', label: 'Automated chat', description: 'Qualify leads with questions' },
  { value: 'partner_app', label: 'Partner app', description: 'Connect a messaging partner' },
];

export const attributionOptions = [
  {
    value: 'standard',
    label: 'Standard',
    description:
      'Optimise ad delivery for a selected time window and engagement type based on your attribution settings.',
    aboutLabel: 'About attribution',
  },
  {
    value: 'incremental',
    label: 'Incremental',
    description:
      'Optimise delivery for incremental conversions using models that predict whether a conversion is caused by an ad.',
    aboutLabel: 'About incremental attribution',
  },
];

export const labelFromOptions = (options, value) =>
  options.find((item) => item.value === value)?.label || value || '—';

export const labelsFromOptions = (options, values = []) =>
  options
    .filter((item) => values.includes(item.value))
    .map((item) => item.label)
    .join(', ');
