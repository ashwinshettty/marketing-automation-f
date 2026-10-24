export const buyingTypes = [
  {
    value: 'auction',
    label: 'Auction',
    description: 'Meta enters your ad in the auction and spends toward your budget. This is the buying type most campaigns use.',
  },
  {
    value: 'reservation',
    label: 'Reservation',
    description: 'Buy a set amount of reach in advance. Reservation is limited to the Awareness objective.',
  },
];

export const objectives = [
  {
    value: 'awareness',
    label: 'Awareness',
    description: 'Show your ads to people who are most likely to remember them.',
  },
  {
    value: 'traffic',
    label: 'Traffic',
    description: 'Send people to a destination, such as your website, app, or Facebook event.',
  },
  {
    value: 'engagement',
    label: 'Engagement',
    description: 'Get more messages, video views, post engagement, Page likes, or event responses.',
  },
  {
    value: 'leads',
    label: 'Leads',
    description: 'Collect leads for your business or brand.',
  },
  {
    value: 'app_promotion',
    label: 'App promotion',
    description: 'Find new people to install your app and continue using it.',
  },
  {
    value: 'sales',
    label: 'Sales',
    description: 'Find people likely to purchase your product or service.',
  },
];

export const specialAdCategories = [
  { value: 'financial_products_services', label: 'Financial products and services' },
  { value: 'employment', label: 'Employment' },
  { value: 'housing', label: 'Housing' },
  { value: 'social_issues', label: 'Social issues, elections or politics' },
];

export const budgetTypes = [
  { value: 'daily', label: 'Daily budget' },
  { value: 'lifetime', label: 'Lifetime budget' },
];

export const bidStrategies = [
  { value: 'highest_volume', label: 'Highest volume or value' },
  { value: 'cost_per_result', label: 'Cost per result goal' },
  { value: 'bid_cap', label: 'Bid cap' },
  { value: 'roas_goal', label: 'ROAS goal' },
];

export const conversionLocations = {
  awareness: [],
  traffic: [
    { value: 'website', label: 'Website' },
    { value: 'app', label: 'App' },
    { value: 'messenger', label: 'Messenger' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'calls', label: 'Calls' },
  ],
  engagement: [
    { value: 'messaging', label: 'Messaging apps' },
    { value: 'on_ad', label: 'On your ad' },
    { value: 'website', label: 'Website' },
    { value: 'app', label: 'App' },
    { value: 'page', label: 'Facebook Page' },
    { value: 'calls', label: 'Calls' },
  ],
  leads: [
    { value: 'instant_form', label: 'Instant forms' },
    { value: 'website', label: 'Website' },
    { value: 'messenger', label: 'Messenger' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'calls', label: 'Calls' },
    { value: 'app', label: 'App' },
  ],
  app_promotion: [{ value: 'app', label: 'App' }],
  sales: [
    { value: 'website', label: 'Website' },
    { value: 'app', label: 'App' },
    { value: 'website_and_app', label: 'Website and app' },
    { value: 'messaging', label: 'Messaging apps' },
    { value: 'calls', label: 'Calls' },
  ],
};

export const conversionEvents = [
  { value: 'purchase', label: 'Purchase' },
  { value: 'add_to_cart', label: 'Add to cart' },
  { value: 'initiate_checkout', label: 'Initiate checkout' },
  { value: 'add_payment_info', label: 'Add payment info' },
  { value: 'complete_registration', label: 'Complete registration' },
  { value: 'lead', label: 'Lead' },
  { value: 'view_content', label: 'View content' },
  { value: 'search', label: 'Search' },
  { value: 'contact', label: 'Contact' },
  { value: 'subscribe', label: 'Subscribe' },
  { value: 'schedule', label: 'Schedule' },
  { value: 'start_trial', label: 'Start trial' },
  { value: 'donate', label: 'Donate' },
  { value: 'find_location', label: 'Find location' },
  { value: 'customize_product', label: 'Customize product' },
];

export const attributionSettings = [
  { value: '7c_1v', label: '7-day click or 1-day view' },
  { value: '7c', label: '7-day click' },
  { value: '1c', label: '1-day click' },
  { value: '1c_1v', label: '1-day click or 1-day view' },
];

export const chargeEvents = [
  { value: 'impression', label: 'Impression' },
  { value: 'link_click', label: 'Link click' },
  { value: 'thruplay', label: 'ThruPlay' },
];

export const radiusOptions = [1, 2, 3, 5, 10, 15, 17, 20, 25, 30, 40, 50, 60, 80];

export const appStores = [
  { value: 'google_play', label: 'Google Play' },
  { value: 'app_store', label: 'App Store' },
  { value: 'both', label: 'Google Play and App Store' },
];

export const messagingApps = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'messenger', label: 'Messenger' },
  { value: 'instagram', label: 'Instagram' },
];

export const locationTypes = [
  { value: 'living_or_recent', label: 'People living in or recently in this location' },
  { value: 'living', label: 'People living in this location' },
  { value: 'recent', label: 'People recently in this location' },
  { value: 'traveling', label: 'People traveling in this location' },
];

export const genders = [
  { value: 'all', label: 'All' },
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
];

export const languages = [
  'English',
  'Hindi',
  'Marathi',
  'Tamil',
  'Telugu',
  'Kannada',
  'Bengali',
  'Gujarati',
  'Punjabi',
  'Malayalam',
  'Urdu',
];

export const platforms = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'messenger', label: 'Messenger' },
  { value: 'audience_network', label: 'Audience Network' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'threads', label: 'Threads' },
];

export const placements = [
  { value: 'facebook_feed', label: 'Feed', platform: 'facebook' },
  { value: 'facebook_profile_feed', label: 'Profile feed', platform: 'facebook' },
  { value: 'facebook_marketplace', label: 'Marketplace', platform: 'facebook' },
  { value: 'facebook_video_feeds', label: 'Video feeds', platform: 'facebook' },
  { value: 'facebook_right_column', label: 'Right column', platform: 'facebook' },
  { value: 'facebook_stories', label: 'Stories', platform: 'facebook' },
  { value: 'facebook_reels', label: 'Reels', platform: 'facebook' },
  { value: 'facebook_instream', label: 'In-stream videos', platform: 'facebook' },
  { value: 'facebook_search', label: 'Search results', platform: 'facebook' },
  { value: 'instagram_feed', label: 'Feed', platform: 'instagram' },
  { value: 'instagram_profile_feed', label: 'Profile feed', platform: 'instagram' },
  { value: 'instagram_explore', label: 'Explore', platform: 'instagram' },
  { value: 'instagram_explore_home', label: 'Explore home', platform: 'instagram' },
  { value: 'instagram_stories', label: 'Stories', platform: 'instagram' },
  { value: 'instagram_reels', label: 'Reels', platform: 'instagram' },
  { value: 'instagram_search', label: 'Search results', platform: 'instagram' },
  { value: 'messenger_inbox', label: 'Inbox', platform: 'messenger' },
  { value: 'messenger_stories', label: 'Stories', platform: 'messenger' },
  { value: 'audience_network_native', label: 'Native, banner and interstitial', platform: 'audience_network' },
  { value: 'audience_network_rewarded', label: 'Rewarded videos', platform: 'audience_network' },
  { value: 'whatsapp_status', label: 'Status', platform: 'whatsapp' },
  { value: 'threads_feed', label: 'Feed', platform: 'threads' },
];

export const devices = [
  { value: 'mobile', label: 'Mobile' },
  { value: 'desktop', label: 'Desktop' },
];

export const operatingSystems = [
  { value: 'all', label: 'All' },
  { value: 'android', label: 'Android' },
  { value: 'ios', label: 'iOS' },
];

export const adSetups = [
  { value: 'create', label: 'Create ad', description: 'Build a new ad from scratch.' },
  { value: 'existing', label: 'Use existing post', description: 'Turn a post you already published into an ad.' },
];

export const adFormats = [
  { value: 'single', label: 'Single image or video' },
  { value: 'carousel', label: 'Carousel' },
  { value: 'collection', label: 'Collection' },
  { value: 'flexible', label: 'Flexible' },
];

export const callToActions = [
  { value: 'learn_more', label: 'Learn more' },
  { value: 'shop_now', label: 'Shop now' },
  { value: 'sign_up', label: 'Sign up' },
  { value: 'book_now', label: 'Book now' },
  { value: 'contact_us', label: 'Contact us' },
  { value: 'download', label: 'Download' },
  { value: 'get_quote', label: 'Get quote' },
  { value: 'apply_now', label: 'Apply now' },
  { value: 'subscribe', label: 'Subscribe' },
  { value: 'watch_more', label: 'Watch more' },
  { value: 'send_message', label: 'Send message' },
  { value: 'call_now', label: 'Call now' },
  { value: 'get_directions', label: 'Get directions' },
  { value: 'install_now', label: 'Install now' },
  { value: 'order_now', label: 'Order now' },
  { value: 'get_offer', label: 'Get offer' },
  { value: 'send_whatsapp', label: 'Send WhatsApp message' },
  { value: 'use_app', label: 'Use app' },
  { value: 'listen_now', label: 'Listen now' },
  { value: 'see_menu', label: 'See menu' },
];

export const previewSurfaces = [
  { value: 'facebook_feed', label: 'Facebook Feed' },
  { value: 'instagram_feed', label: 'Instagram Feed' },
  { value: 'instagram_stories', label: 'Instagram Stories' },
  { value: 'instagram_reels', label: 'Instagram Reels' },
  { value: 'audience_network', label: 'Audience Network' },
];

export const campaignBudgetDefault = (objective) =>
  objective === 'sales' || objective === 'leads' || objective === 'app_promotion'
    ? 'campaign'
    : 'adset';

export const performanceGoals = (objective, location) => {
  if (objective === 'awareness') {
    return [
      { value: 'reach', label: 'Maximize reach of ads' },
      { value: 'impressions', label: 'Maximize number of impressions' },
      { value: 'ad_recall', label: 'Maximize ad recall lift' },
      { value: 'thruplay', label: 'Maximize ThruPlay views' },
      { value: 'video_2s', label: 'Maximize 2-second continuous video views' },
    ];
  }
  if (objective === 'traffic' && location === 'website') {
    return [
      { value: 'landing_page_views', label: 'Maximize number of landing page views' },
      { value: 'link_clicks', label: 'Maximize number of link clicks' },
      { value: 'reach', label: 'Maximize daily unique reach' },
      { value: 'impressions', label: 'Maximize number of impressions' },
    ];
  }
  if (objective === 'traffic' && ['messenger', 'instagram', 'whatsapp'].includes(location)) {
    return [
      { value: 'conversations', label: 'Maximize number of conversations' },
      { value: 'link_clicks', label: 'Maximize number of link clicks' },
    ];
  }
  if (location === 'calls') {
    return [{ value: 'calls', label: 'Maximize number of calls' }];
  }
  if (objective === 'engagement' && location === 'on_ad') {
    return [
      { value: 'post_engagement', label: 'Maximize post engagement' },
      { value: 'thruplay', label: 'Maximize ThruPlay views' },
      { value: 'video_2s', label: 'Maximize 2-second continuous video views' },
      { value: 'event_responses', label: 'Maximize number of event responses' },
      { value: 'page_likes', label: 'Maximize number of Page likes' },
    ];
  }
  if (objective === 'engagement' && (location === 'messaging' || location === 'page')) {
    return [{ value: 'conversations', label: 'Maximize number of conversations' }];
  }
  if (objective === 'leads' && location === 'website') {
    return [
      { value: 'conversions', label: 'Maximize number of conversions' },
      { value: 'conversion_leads', label: 'Maximize number of conversion leads' },
      { value: 'landing_page_views', label: 'Maximize number of landing page views' },
      { value: 'link_clicks', label: 'Maximize number of link clicks' },
    ];
  }
  if (objective === 'leads') {
    return [
      { value: 'leads', label: 'Maximize number of leads' },
      { value: 'conversion_leads', label: 'Maximize number of conversion leads' },
    ];
  }
  if (objective === 'app_promotion') {
    return [
      { value: 'app_installs', label: 'Maximize number of app installs' },
      { value: 'app_events', label: 'Maximize number of app events' },
      { value: 'value', label: 'Maximize value of conversions' },
      { value: 'link_clicks', label: 'Maximize number of link clicks' },
    ];
  }
  if (objective === 'sales' && location === 'messaging') {
    return [
      { value: 'conversations', label: 'Maximize number of conversations' },
      { value: 'conversions', label: 'Maximize number of conversions' },
    ];
  }
  if (objective === 'sales') {
    return [
      { value: 'conversions', label: 'Maximize number of conversions' },
      { value: 'value', label: 'Maximize value of conversions' },
      { value: 'landing_page_views', label: 'Maximize number of landing page views' },
      { value: 'link_clicks', label: 'Maximize number of link clicks' },
    ];
  }
  return [
    { value: 'link_clicks', label: 'Maximize number of link clicks' },
    { value: 'landing_page_views', label: 'Maximize number of landing page views' },
  ];
};

export const needsDataset = (objective, location) =>
  ['website', 'website_and_app', 'app'].includes(location)
  && ['sales', 'leads', 'app_promotion', 'traffic'].includes(objective);

export const labelOf = (options, value) =>
  options.find((item) => item.value === value)?.label || '';
