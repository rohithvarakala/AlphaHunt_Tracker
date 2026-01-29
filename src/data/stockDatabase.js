/**
 * Comprehensive US Stock Database
 * Covers S&P 500, NASDAQ 100, and popular growth/momentum stocks.
 * ~300 entries with sector, industry, and market-cap classifications.
 */

const STOCKS = [
  // ─────────────────────────────────────────────────────────────────────────────
  // TECHNOLOGY
  // ─────────────────────────────────────────────────────────────────────────────
  // Software - Infrastructure
  { symbol: "MSFT",  name: "Microsoft Corporation",              sector: "Technology", industry: "Software - Infrastructure",    marketCap: "Mega" },
  { symbol: "ORCL",  name: "Oracle Corporation",                 sector: "Technology", industry: "Software - Infrastructure",    marketCap: "Mega" },
  { symbol: "CRM",   name: "Salesforce Inc",                     sector: "Technology", industry: "Software - Infrastructure",    marketCap: "Mega" },
  { symbol: "NOW",   name: "ServiceNow Inc",                     sector: "Technology", industry: "Software - Infrastructure",    marketCap: "Large" },
  { symbol: "INTU",  name: "Intuit Inc",                         sector: "Technology", industry: "Software - Infrastructure",    marketCap: "Large" },
  { symbol: "SNPS",  name: "Synopsys Inc",                       sector: "Technology", industry: "Software - Infrastructure",    marketCap: "Large" },
  { symbol: "CDNS",  name: "Cadence Design Systems Inc",         sector: "Technology", industry: "Software - Infrastructure",    marketCap: "Large" },
  { symbol: "ADSK",  name: "Autodesk Inc",                       sector: "Technology", industry: "Software - Infrastructure",    marketCap: "Large" },
  { symbol: "PANW",  name: "Palo Alto Networks Inc",             sector: "Technology", industry: "Software - Infrastructure",    marketCap: "Large" },
  { symbol: "FTNT",  name: "Fortinet Inc",                       sector: "Technology", industry: "Software - Infrastructure",    marketCap: "Large" },
  { symbol: "CRWD",  name: "CrowdStrike Holdings Inc",           sector: "Technology", industry: "Software - Infrastructure",    marketCap: "Large" },
  { symbol: "ZS",    name: "Zscaler Inc",                        sector: "Technology", industry: "Software - Infrastructure",    marketCap: "Mid" },
  { symbol: "NET",   name: "Cloudflare Inc",                     sector: "Technology", industry: "Software - Infrastructure",    marketCap: "Mid" },
  { symbol: "DDOG",  name: "Datadog Inc",                        sector: "Technology", industry: "Software - Infrastructure",    marketCap: "Mid" },
  { symbol: "MDB",   name: "MongoDB Inc",                        sector: "Technology", industry: "Software - Infrastructure",    marketCap: "Mid" },
  { symbol: "SNOW",  name: "Snowflake Inc",                      sector: "Technology", industry: "Software - Infrastructure",    marketCap: "Mid" },
  { symbol: "OKTA",  name: "Okta Inc",                           sector: "Technology", industry: "Software - Infrastructure",    marketCap: "Mid" },
  { symbol: "ESTC",  name: "Elastic NV",                         sector: "Technology", industry: "Software - Infrastructure",    marketCap: "Mid" },
  { symbol: "CFLT",  name: "Confluent Inc",                      sector: "Technology", industry: "Software - Infrastructure",    marketCap: "Mid" },
  { symbol: "S",     name: "SentinelOne Inc",                    sector: "Technology", industry: "Software - Infrastructure",    marketCap: "Mid" },
  { symbol: "GTLB",  name: "GitLab Inc",                         sector: "Technology", industry: "Software - Infrastructure",    marketCap: "Mid" },

  // Software - Application
  { symbol: "WDAY",  name: "Workday Inc",                        sector: "Technology", industry: "Software - Application",       marketCap: "Large" },
  { symbol: "TEAM",  name: "Atlassian Corporation",              sector: "Technology", industry: "Software - Application",       marketCap: "Large" },
  { symbol: "HUBS",  name: "HubSpot Inc",                        sector: "Technology", industry: "Software - Application",       marketCap: "Mid" },
  { symbol: "VEEV",  name: "Veeva Systems Inc",                  sector: "Technology", industry: "Software - Application",       marketCap: "Mid" },
  { symbol: "SPLK",  name: "Splunk Inc",                         sector: "Technology", industry: "Software - Application",       marketCap: "Mid" },
  { symbol: "DOCU",  name: "DocuSign Inc",                       sector: "Technology", industry: "Software - Application",       marketCap: "Mid" },
  { symbol: "BILL",  name: "BILL Holdings Inc",                  sector: "Technology", industry: "Software - Application",       marketCap: "Mid" },
  { symbol: "PCTY",  name: "Paylocity Holding Corp",             sector: "Technology", industry: "Software - Application",       marketCap: "Mid" },
  { symbol: "PAYC",  name: "Paycom Software Inc",                sector: "Technology", industry: "Software - Application",       marketCap: "Mid" },
  { symbol: "MNDY",  name: "monday.com Ltd",                     sector: "Technology", industry: "Software - Application",       marketCap: "Mid" },
  { symbol: "AYX",   name: "Alteryx Inc",                        sector: "Technology", industry: "Software - Application",       marketCap: "Small" },
  { symbol: "FIVN",  name: "Five9 Inc",                          sector: "Technology", industry: "Software - Application",       marketCap: "Small" },
  { symbol: "PATH",  name: "UiPath Inc",                         sector: "Technology", industry: "Software - Application",       marketCap: "Mid" },
  { symbol: "DOCS",  name: "Doximity Inc",                       sector: "Technology", industry: "Software - Application",       marketCap: "Mid" },
  { symbol: "TWLO",  name: "Twilio Inc",                         sector: "Technology", industry: "Software - Application",       marketCap: "Mid" },
  { symbol: "ZM",    name: "Zoom Video Communications Inc",      sector: "Technology", industry: "Software - Application",       marketCap: "Mid" },

  // Semiconductors
  { symbol: "NVDA",  name: "NVIDIA Corporation",                 sector: "Technology", industry: "Semiconductors",              marketCap: "Mega" },
  { symbol: "AVGO",  name: "Broadcom Inc",                       sector: "Technology", industry: "Semiconductors",              marketCap: "Mega" },
  { symbol: "AMD",   name: "Advanced Micro Devices Inc",         sector: "Technology", industry: "Semiconductors",              marketCap: "Mega" },
  { symbol: "TXN",   name: "Texas Instruments Inc",              sector: "Technology", industry: "Semiconductors",              marketCap: "Large" },
  { symbol: "QCOM",  name: "Qualcomm Inc",                       sector: "Technology", industry: "Semiconductors",              marketCap: "Large" },
  { symbol: "INTC",  name: "Intel Corporation",                  sector: "Technology", industry: "Semiconductors",              marketCap: "Large" },
  { symbol: "ADI",   name: "Analog Devices Inc",                 sector: "Technology", industry: "Semiconductors",              marketCap: "Large" },
  { symbol: "LRCX",  name: "Lam Research Corporation",           sector: "Technology", industry: "Semiconductors",              marketCap: "Large" },
  { symbol: "KLAC",  name: "KLA Corporation",                    sector: "Technology", industry: "Semiconductors",              marketCap: "Large" },
  { symbol: "MRVL",  name: "Marvell Technology Inc",             sector: "Technology", industry: "Semiconductors",              marketCap: "Large" },
  { symbol: "ANET",  name: "Arista Networks Inc",                sector: "Technology", industry: "Semiconductors",              marketCap: "Large" },
  { symbol: "MU",    name: "Micron Technology Inc",              sector: "Technology", industry: "Semiconductors",              marketCap: "Large" },
  { symbol: "ON",    name: "ON Semiconductor Corp",              sector: "Technology", industry: "Semiconductors",              marketCap: "Mid" },
  { symbol: "NXPI",  name: "NXP Semiconductors NV",              sector: "Technology", industry: "Semiconductors",              marketCap: "Mid" },
  { symbol: "SWKS",  name: "Skyworks Solutions Inc",             sector: "Technology", industry: "Semiconductors",              marketCap: "Mid" },
  { symbol: "MCHP",  name: "Microchip Technology Inc",           sector: "Technology", industry: "Semiconductors",              marketCap: "Mid" },
  { symbol: "TER",   name: "Teradyne Inc",                       sector: "Technology", industry: "Semiconductors",              marketCap: "Mid" },
  { symbol: "MPWR",  name: "Monolithic Power Systems Inc",       sector: "Technology", industry: "Semiconductors",              marketCap: "Mid" },
  { symbol: "WOLF",  name: "Wolfspeed Inc",                      sector: "Technology", industry: "Semiconductors",              marketCap: "Small" },
  { symbol: "GFS",   name: "GlobalFoundries Inc",                sector: "Technology", industry: "Semiconductors",              marketCap: "Mid" },
  { symbol: "ARM",   name: "Arm Holdings plc",                   sector: "Technology", industry: "Semiconductors",              marketCap: "Large" },
  { symbol: "SMCI",  name: "Super Micro Computer Inc",           sector: "Technology", industry: "Semiconductors",              marketCap: "Mid" },
  { symbol: "IONQ",  name: "IonQ Inc",                           sector: "Technology", industry: "Semiconductors",              marketCap: "Small" },

  // Hardware / Consumer Electronics
  { symbol: "AAPL",  name: "Apple Inc",                          sector: "Technology", industry: "Consumer Electronics",         marketCap: "Mega" },
  { symbol: "CSCO",  name: "Cisco Systems Inc",                  sector: "Technology", industry: "Communication Equipment",      marketCap: "Large" },
  { symbol: "ACN",   name: "Accenture plc",                      sector: "Technology", industry: "IT Services",                 marketCap: "Mega" },
  { symbol: "ADP",   name: "Automatic Data Processing Inc",      sector: "Technology", industry: "IT Services",                 marketCap: "Large" },
  { symbol: "FIS",   name: "Fidelity National Information Svcs",  sector: "Technology", industry: "IT Services",                marketCap: "Large" },
  { symbol: "FISV",  name: "Fiserv Inc",                         sector: "Technology", industry: "IT Services",                 marketCap: "Large" },
  { symbol: "IBM",   name: "International Business Machines",     sector: "Technology", industry: "IT Services",                marketCap: "Large" },
  { symbol: "HPQ",   name: "HP Inc",                             sector: "Technology", industry: "Computer Hardware",            marketCap: "Mid" },
  { symbol: "DELL",  name: "Dell Technologies Inc",              sector: "Technology", industry: "Computer Hardware",            marketCap: "Large" },
  { symbol: "WDC",   name: "Western Digital Corporation",        sector: "Technology", industry: "Data Storage",                 marketCap: "Mid" },
  { symbol: "STX",   name: "Seagate Technology Holdings",        sector: "Technology", industry: "Data Storage",                 marketCap: "Mid" },

  // AI / Emerging Tech
  { symbol: "PLTR",  name: "Palantir Technologies Inc",          sector: "Technology", industry: "Software - Infrastructure",    marketCap: "Mid" },
  { symbol: "AI",    name: "C3.ai Inc",                          sector: "Technology", industry: "Software - Infrastructure",    marketCap: "Small" },
  { symbol: "TTD",   name: "The Trade Desk Inc",                 sector: "Technology", industry: "Software - Application",       marketCap: "Mid" },

  // ─────────────────────────────────────────────────────────────────────────────
  // COMMUNICATION SERVICES
  // ─────────────────────────────────────────────────────────────────────────────
  { symbol: "GOOGL", name: "Alphabet Inc Class A",               sector: "Communication", industry: "Internet Content & Information", marketCap: "Mega" },
  { symbol: "GOOG",  name: "Alphabet Inc Class C",               sector: "Communication", industry: "Internet Content & Information", marketCap: "Mega" },
  { symbol: "META",  name: "Meta Platforms Inc",                  sector: "Communication", industry: "Internet Content & Information", marketCap: "Mega" },
  { symbol: "DIS",   name: "The Walt Disney Company",            sector: "Communication", industry: "Entertainment",            marketCap: "Mega" },
  { symbol: "CMCSA", name: "Comcast Corporation",                sector: "Communication", industry: "Entertainment",            marketCap: "Large" },
  { symbol: "NFLX",  name: "Netflix Inc",                        sector: "Communication", industry: "Entertainment",            marketCap: "Mega" },
  { symbol: "T",     name: "AT&T Inc",                           sector: "Communication", industry: "Telecom Services",         marketCap: "Large" },
  { symbol: "VZ",    name: "Verizon Communications Inc",         sector: "Communication", industry: "Telecom Services",         marketCap: "Large" },
  { symbol: "TMUS",  name: "T-Mobile US Inc",                    sector: "Communication", industry: "Telecom Services",         marketCap: "Large" },
  { symbol: "ATVI",  name: "Activision Blizzard Inc",            sector: "Communication", industry: "Electronic Gaming",        marketCap: "Large" },
  { symbol: "SNAP",  name: "Snap Inc",                           sector: "Communication", industry: "Internet Content & Information", marketCap: "Mid" },
  { symbol: "PINS",  name: "Pinterest Inc",                      sector: "Communication", industry: "Internet Content & Information", marketCap: "Mid" },
  { symbol: "MTCH",  name: "Match Group Inc",                    sector: "Communication", industry: "Internet Content & Information", marketCap: "Mid" },
  { symbol: "SPOT",  name: "Spotify Technology SA",              sector: "Communication", industry: "Internet Content & Information", marketCap: "Mid" },
  { symbol: "ROKU",  name: "Roku Inc",                           sector: "Communication", industry: "Entertainment",            marketCap: "Mid" },
  { symbol: "RBLX",  name: "Roblox Corporation",                 sector: "Communication", industry: "Electronic Gaming",        marketCap: "Mid" },
  { symbol: "U",     name: "Unity Software Inc",                 sector: "Communication", industry: "Electronic Gaming",        marketCap: "Mid" },
  { symbol: "DKNG",  name: "DraftKings Inc",                     sector: "Communication", industry: "Gambling",                 marketCap: "Mid" },
  { symbol: "BIDU",  name: "Baidu Inc",                          sector: "Communication", industry: "Internet Content & Information", marketCap: "Mid" },

  // ─────────────────────────────────────────────────────────────────────────────
  // CONSUMER CYCLICAL
  // ─────────────────────────────────────────────────────────────────────────────
  { symbol: "AMZN",  name: "Amazon.com Inc",                     sector: "Consumer Cyclical", industry: "Internet Retail",       marketCap: "Mega" },
  { symbol: "TSLA",  name: "Tesla Inc",                          sector: "Consumer Cyclical", industry: "Auto Manufacturers",    marketCap: "Mega" },
  { symbol: "HD",    name: "The Home Depot Inc",                 sector: "Consumer Cyclical", industry: "Home Improvement Retail", marketCap: "Mega" },
  { symbol: "MCD",   name: "McDonald's Corporation",             sector: "Consumer Cyclical", industry: "Restaurants",           marketCap: "Mega" },
  { symbol: "BKNG",  name: "Booking Holdings Inc",               sector: "Consumer Cyclical", industry: "Travel Services",      marketCap: "Large" },
  { symbol: "LOW",   name: "Lowe's Companies Inc",               sector: "Consumer Cyclical", industry: "Home Improvement Retail", marketCap: "Large" },
  { symbol: "TJX",   name: "The TJX Companies Inc",              sector: "Consumer Cyclical", industry: "Apparel Retail",       marketCap: "Large" },
  { symbol: "SBUX",  name: "Starbucks Corporation",              sector: "Consumer Cyclical", industry: "Restaurants",           marketCap: "Large" },
  { symbol: "NKE",   name: "NIKE Inc",                           sector: "Consumer Cyclical", industry: "Footwear & Accessories", marketCap: "Large" },
  { symbol: "TGT",   name: "Target Corporation",                 sector: "Consumer Cyclical", industry: "Discount Stores",      marketCap: "Large" },
  { symbol: "GM",    name: "General Motors Company",             sector: "Consumer Cyclical", industry: "Auto Manufacturers",    marketCap: "Mid" },
  { symbol: "F",     name: "Ford Motor Company",                 sector: "Consumer Cyclical", industry: "Auto Manufacturers",    marketCap: "Mid" },
  { symbol: "ABNB",  name: "Airbnb Inc",                         sector: "Consumer Cyclical", industry: "Travel Services",      marketCap: "Large" },
  { symbol: "LULU",  name: "Lululemon Athletica Inc",            sector: "Consumer Cyclical", industry: "Apparel Retail",       marketCap: "Large" },
  { symbol: "ROST",  name: "Ross Stores Inc",                    sector: "Consumer Cyclical", industry: "Apparel Retail",       marketCap: "Large" },
  { symbol: "ETSY",  name: "Etsy Inc",                           sector: "Consumer Cyclical", industry: "Internet Retail",       marketCap: "Mid" },
  { symbol: "W",     name: "Wayfair Inc",                        sector: "Consumer Cyclical", industry: "Internet Retail",       marketCap: "Mid" },
  { symbol: "CHWY",  name: "Chewy Inc",                          sector: "Consumer Cyclical", industry: "Internet Retail",      marketCap: "Mid" },
  { symbol: "DASH",  name: "DoorDash Inc",                       sector: "Consumer Cyclical", industry: "Internet Retail",      marketCap: "Mid" },
  { symbol: "UBER",  name: "Uber Technologies Inc",              sector: "Consumer Cyclical", industry: "Travel Services",      marketCap: "Large" },
  { symbol: "LYFT",  name: "Lyft Inc",                           sector: "Consumer Cyclical", industry: "Travel Services",      marketCap: "Small" },
  { symbol: "RIVN",  name: "Rivian Automotive Inc",              sector: "Consumer Cyclical", industry: "Auto Manufacturers",    marketCap: "Mid" },
  { symbol: "LCID",  name: "Lucid Group Inc",                    sector: "Consumer Cyclical", industry: "Auto Manufacturers",    marketCap: "Small" },
  { symbol: "NIO",   name: "NIO Inc",                            sector: "Consumer Cyclical", industry: "Auto Manufacturers",    marketCap: "Small" },
  { symbol: "LI",    name: "Li Auto Inc",                        sector: "Consumer Cyclical", industry: "Auto Manufacturers",    marketCap: "Mid" },
  { symbol: "XPEV",  name: "XPeng Inc",                          sector: "Consumer Cyclical", industry: "Auto Manufacturers",   marketCap: "Small" },
  { symbol: "SHOP",  name: "Shopify Inc",                        sector: "Consumer Cyclical", industry: "Internet Retail",       marketCap: "Large" },
  { symbol: "MELI",  name: "MercadoLibre Inc",                   sector: "Consumer Cyclical", industry: "Internet Retail",      marketCap: "Large" },
  { symbol: "SE",    name: "Sea Limited",                        sector: "Consumer Cyclical", industry: "Internet Retail",       marketCap: "Mid" },
  { symbol: "JD",    name: "JD.com Inc",                         sector: "Consumer Cyclical", industry: "Internet Retail",       marketCap: "Mid" },
  { symbol: "PDD",   name: "PDD Holdings Inc",                   sector: "Consumer Cyclical", industry: "Internet Retail",      marketCap: "Large" },
  { symbol: "BABA",  name: "Alibaba Group Holding Ltd",          sector: "Consumer Cyclical", industry: "Internet Retail",      marketCap: "Large" },
  { symbol: "GRAB",  name: "Grab Holdings Ltd",                  sector: "Consumer Cyclical", industry: "Internet Retail",      marketCap: "Small" },
  { symbol: "TOST",  name: "Toast Inc",                          sector: "Consumer Cyclical", industry: "Internet Retail",      marketCap: "Mid" },
  { symbol: "MAR",   name: "Marriott International Inc",         sector: "Consumer Cyclical", industry: "Lodging",              marketCap: "Large" },
  { symbol: "HLT",   name: "Hilton Worldwide Holdings Inc",      sector: "Consumer Cyclical", industry: "Lodging",             marketCap: "Large" },
  { symbol: "CMG",   name: "Chipotle Mexican Grill Inc",         sector: "Consumer Cyclical", industry: "Restaurants",          marketCap: "Large" },
  { symbol: "DHI",   name: "D.R. Horton Inc",                    sector: "Consumer Cyclical", industry: "Residential Construction", marketCap: "Large" },
  { symbol: "LEN",   name: "Lennar Corporation",                 sector: "Consumer Cyclical", industry: "Residential Construction", marketCap: "Mid" },
  { symbol: "ORLY",  name: "O'Reilly Automotive Inc",            sector: "Consumer Cyclical", industry: "Specialty Retail",     marketCap: "Large" },
  { symbol: "AZO",   name: "AutoZone Inc",                       sector: "Consumer Cyclical", industry: "Specialty Retail",     marketCap: "Large" },

  // ─────────────────────────────────────────────────────────────────────────────
  // CONSUMER DEFENSIVE
  // ─────────────────────────────────────────────────────────────────────────────
  { symbol: "WMT",   name: "Walmart Inc",                        sector: "Consumer Defensive", industry: "Discount Stores",     marketCap: "Mega" },
  { symbol: "PG",    name: "The Procter & Gamble Company",       sector: "Consumer Defensive", industry: "Household Products",  marketCap: "Mega" },
  { symbol: "KO",    name: "The Coca-Cola Company",              sector: "Consumer Defensive", industry: "Beverages - Non-Alcoholic", marketCap: "Mega" },
  { symbol: "PEP",   name: "PepsiCo Inc",                        sector: "Consumer Defensive", industry: "Beverages - Non-Alcoholic", marketCap: "Mega" },
  { symbol: "COST",  name: "Costco Wholesale Corporation",       sector: "Consumer Defensive", industry: "Discount Stores",    marketCap: "Mega" },
  { symbol: "PM",    name: "Philip Morris International Inc",    sector: "Consumer Defensive", industry: "Tobacco",             marketCap: "Large" },
  { symbol: "MDLZ",  name: "Mondelez International Inc",         sector: "Consumer Defensive", industry: "Confectioners",      marketCap: "Large" },
  { symbol: "MO",    name: "Altria Group Inc",                   sector: "Consumer Defensive", industry: "Tobacco",             marketCap: "Large" },
  { symbol: "CL",    name: "Colgate-Palmolive Company",          sector: "Consumer Defensive", industry: "Household Products",  marketCap: "Large" },
  { symbol: "EL",    name: "The Estee Lauder Companies Inc",     sector: "Consumer Defensive", industry: "Household Products",  marketCap: "Large" },
  { symbol: "KHC",   name: "The Kraft Heinz Company",            sector: "Consumer Defensive", industry: "Packaged Foods",      marketCap: "Mid" },
  { symbol: "GIS",   name: "General Mills Inc",                  sector: "Consumer Defensive", industry: "Packaged Foods",      marketCap: "Mid" },
  { symbol: "SYY",   name: "Sysco Corporation",                  sector: "Consumer Defensive", industry: "Food Distribution",   marketCap: "Mid" },
  { symbol: "HSY",   name: "The Hershey Company",                sector: "Consumer Defensive", industry: "Confectioners",      marketCap: "Mid" },
  { symbol: "K",     name: "Kellanova",                          sector: "Consumer Defensive", industry: "Packaged Foods",      marketCap: "Mid" },
  { symbol: "KR",    name: "The Kroger Co",                      sector: "Consumer Defensive", industry: "Grocery Stores",      marketCap: "Mid" },
  { symbol: "STZ",   name: "Constellation Brands Inc",           sector: "Consumer Defensive", industry: "Beverages - Alcoholic", marketCap: "Mid" },
  { symbol: "ADM",   name: "Archer-Daniels-Midland Company",     sector: "Consumer Defensive", industry: "Farm Products",      marketCap: "Mid" },

  // ─────────────────────────────────────────────────────────────────────────────
  // HEALTHCARE
  // ─────────────────────────────────────────────────────────────────────────────
  { symbol: "UNH",   name: "UnitedHealth Group Inc",             sector: "Healthcare", industry: "Healthcare Plans",            marketCap: "Mega" },
  { symbol: "JNJ",   name: "Johnson & Johnson",                  sector: "Healthcare", industry: "Drug Manufacturers",          marketCap: "Mega" },
  { symbol: "LLY",   name: "Eli Lilly and Company",              sector: "Healthcare", industry: "Drug Manufacturers",          marketCap: "Mega" },
  { symbol: "ABBV",  name: "AbbVie Inc",                         sector: "Healthcare", industry: "Drug Manufacturers",          marketCap: "Mega" },
  { symbol: "MRK",   name: "Merck & Co Inc",                     sector: "Healthcare", industry: "Drug Manufacturers",          marketCap: "Mega" },
  { symbol: "PFE",   name: "Pfizer Inc",                         sector: "Healthcare", industry: "Drug Manufacturers",          marketCap: "Large" },
  { symbol: "TMO",   name: "Thermo Fisher Scientific Inc",       sector: "Healthcare", industry: "Diagnostics & Research",     marketCap: "Mega" },
  { symbol: "ABT",   name: "Abbott Laboratories",                sector: "Healthcare", industry: "Medical Devices",             marketCap: "Mega" },
  { symbol: "DHR",   name: "Danaher Corporation",                sector: "Healthcare", industry: "Diagnostics & Research",     marketCap: "Mega" },
  { symbol: "BMY",   name: "Bristol-Myers Squibb Company",       sector: "Healthcare", industry: "Drug Manufacturers",          marketCap: "Large" },
  { symbol: "AMGN",  name: "Amgen Inc",                          sector: "Healthcare", industry: "Drug Manufacturers",          marketCap: "Large" },
  { symbol: "GILD",  name: "Gilead Sciences Inc",                sector: "Healthcare", industry: "Drug Manufacturers",          marketCap: "Large" },
  { symbol: "VRTX",  name: "Vertex Pharmaceuticals Inc",         sector: "Healthcare", industry: "Biotechnology",              marketCap: "Large" },
  { symbol: "ISRG",  name: "Intuitive Surgical Inc",             sector: "Healthcare", industry: "Medical Instruments",         marketCap: "Large" },
  { symbol: "SYK",   name: "Stryker Corporation",                sector: "Healthcare", industry: "Medical Devices",             marketCap: "Large" },
  { symbol: "REGN",  name: "Regeneron Pharmaceuticals Inc",      sector: "Healthcare", industry: "Biotechnology",              marketCap: "Large" },
  { symbol: "CI",    name: "The Cigna Group",                    sector: "Healthcare", industry: "Healthcare Plans",            marketCap: "Large" },
  { symbol: "BDX",   name: "Becton Dickinson and Company",       sector: "Healthcare", industry: "Medical Instruments",         marketCap: "Large" },
  { symbol: "ZTS",   name: "Zoetis Inc",                         sector: "Healthcare", industry: "Drug Manufacturers",          marketCap: "Large" },
  { symbol: "CVS",   name: "CVS Health Corporation",             sector: "Healthcare", industry: "Healthcare Plans",            marketCap: "Large" },
  { symbol: "EW",    name: "Edwards Lifesciences Corporation",   sector: "Healthcare", industry: "Medical Devices",             marketCap: "Mid" },
  { symbol: "HCA",   name: "HCA Healthcare Inc",                 sector: "Healthcare", industry: "Medical Care Facilities",     marketCap: "Large" },
  { symbol: "DXCM",  name: "DexCom Inc",                         sector: "Healthcare", industry: "Medical Devices",             marketCap: "Mid" },
  { symbol: "IQV",   name: "IQVIA Holdings Inc",                 sector: "Healthcare", industry: "Diagnostics & Research",     marketCap: "Large" },
  { symbol: "A",     name: "Agilent Technologies Inc",           sector: "Healthcare", industry: "Diagnostics & Research",     marketCap: "Mid" },
  { symbol: "MRNA",  name: "Moderna Inc",                        sector: "Healthcare", industry: "Biotechnology",              marketCap: "Mid" },
  { symbol: "BIIB",  name: "Biogen Inc",                         sector: "Healthcare", industry: "Biotechnology",              marketCap: "Mid" },
  { symbol: "ILMN",  name: "Illumina Inc",                       sector: "Healthcare", industry: "Diagnostics & Research",     marketCap: "Mid" },
  { symbol: "MCK",   name: "McKesson Corporation",               sector: "Healthcare", industry: "Medical Distribution",        marketCap: "Large" },
  { symbol: "BSX",   name: "Boston Scientific Corporation",      sector: "Healthcare", industry: "Medical Devices",             marketCap: "Large" },

  // ─────────────────────────────────────────────────────────────────────────────
  // FINANCE
  // ─────────────────────────────────────────────────────────────────────────────
  { symbol: "BRK.B", name: "Berkshire Hathaway Inc Class B",     sector: "Finance", industry: "Insurance - Diversified",        marketCap: "Mega" },
  { symbol: "JPM",   name: "JPMorgan Chase & Co",                sector: "Finance", industry: "Banks - Diversified",            marketCap: "Mega" },
  { symbol: "V",     name: "Visa Inc",                           sector: "Finance", industry: "Credit Services",                marketCap: "Mega" },
  { symbol: "MA",    name: "Mastercard Inc",                     sector: "Finance", industry: "Credit Services",                marketCap: "Mega" },
  { symbol: "BAC",   name: "Bank of America Corp",               sector: "Finance", industry: "Banks - Diversified",            marketCap: "Large" },
  { symbol: "SPGI",  name: "S&P Global Inc",                     sector: "Finance", industry: "Financial Data & Exchanges",     marketCap: "Large" },
  { symbol: "GS",    name: "The Goldman Sachs Group Inc",        sector: "Finance", industry: "Capital Markets",                marketCap: "Large" },
  { symbol: "MS",    name: "Morgan Stanley",                     sector: "Finance", industry: "Capital Markets",                marketCap: "Large" },
  { symbol: "C",     name: "Citigroup Inc",                      sector: "Finance", industry: "Banks - Diversified",            marketCap: "Large" },
  { symbol: "AXP",   name: "American Express Company",           sector: "Finance", industry: "Credit Services",                marketCap: "Large" },
  { symbol: "BLK",   name: "BlackRock Inc",                      sector: "Finance", industry: "Asset Management",               marketCap: "Large" },
  { symbol: "SCHW",  name: "The Charles Schwab Corporation",     sector: "Finance", industry: "Capital Markets",                marketCap: "Large" },
  { symbol: "USB",   name: "U.S. Bancorp",                       sector: "Finance", industry: "Banks - Regional",               marketCap: "Large" },
  { symbol: "PNC",   name: "The PNC Financial Services Group",   sector: "Finance", industry: "Banks - Regional",               marketCap: "Large" },
  { symbol: "PGR",   name: "The Progressive Corporation",        sector: "Finance", industry: "Insurance - Property & Casualty", marketCap: "Large" },
  { symbol: "MMC",   name: "Marsh & McLennan Companies Inc",     sector: "Finance", industry: "Insurance - Brokers",            marketCap: "Large" },
  { symbol: "CME",   name: "CME Group Inc",                      sector: "Finance", industry: "Financial Data & Exchanges",     marketCap: "Large" },
  { symbol: "MCO",   name: "Moody's Corporation",                sector: "Finance", industry: "Financial Data & Exchanges",     marketCap: "Large" },
  { symbol: "ICE",   name: "Intercontinental Exchange Inc",      sector: "Finance", industry: "Financial Data & Exchanges",     marketCap: "Large" },
  { symbol: "AON",   name: "Aon plc",                            sector: "Finance", industry: "Insurance - Brokers",            marketCap: "Large" },
  { symbol: "PYPL",  name: "PayPal Holdings Inc",                sector: "Finance", industry: "Credit Services",                marketCap: "Large" },
  { symbol: "COIN",  name: "Coinbase Global Inc",                sector: "Finance", industry: "Financial Data & Exchanges",     marketCap: "Mid" },
  { symbol: "SQ",    name: "Block Inc",                          sector: "Finance", industry: "Credit Services",                marketCap: "Mid" },
  { symbol: "SOFI",  name: "SoFi Technologies Inc",              sector: "Finance", industry: "Credit Services",                marketCap: "Mid" },
  { symbol: "HOOD",  name: "Robinhood Markets Inc",              sector: "Finance", industry: "Capital Markets",                marketCap: "Small" },
  { symbol: "AFRM",  name: "Affirm Holdings Inc",                sector: "Finance", industry: "Credit Services",                marketCap: "Mid" },
  { symbol: "UPST",  name: "Upstart Holdings Inc",               sector: "Finance", industry: "Credit Services",                marketCap: "Small" },
  { symbol: "NU",    name: "Nu Holdings Ltd",                    sector: "Finance", industry: "Banks - Diversified",            marketCap: "Mid" },
  { symbol: "FOUR",  name: "Shift4 Payments Inc",                sector: "Finance", industry: "Credit Services",                marketCap: "Mid" },
  { symbol: "DLO",   name: "DLocal Limited",                     sector: "Finance", industry: "Credit Services",                marketCap: "Small" },
  { symbol: "MARA",  name: "Marathon Digital Holdings Inc",       sector: "Finance", industry: "Capital Markets",               marketCap: "Small" },
  { symbol: "RIOT",  name: "Riot Platforms Inc",                  sector: "Finance", industry: "Capital Markets",               marketCap: "Small" },
  { symbol: "CB",    name: "Chubb Limited",                      sector: "Finance", industry: "Insurance - Diversified",        marketCap: "Large" },
  { symbol: "AFL",   name: "Aflac Inc",                          sector: "Finance", industry: "Insurance - Life",               marketCap: "Mid" },
  { symbol: "TFC",   name: "Truist Financial Corporation",       sector: "Finance", industry: "Banks - Regional",               marketCap: "Mid" },
  { symbol: "COF",   name: "Capital One Financial Corp",         sector: "Finance", industry: "Credit Services",                marketCap: "Mid" },
  { symbol: "MET",   name: "MetLife Inc",                        sector: "Finance", industry: "Insurance - Life",               marketCap: "Mid" },

  // ─────────────────────────────────────────────────────────────────────────────
  // ENERGY
  // ─────────────────────────────────────────────────────────────────────────────
  { symbol: "XOM",   name: "Exxon Mobil Corporation",            sector: "Energy", industry: "Oil & Gas Integrated",            marketCap: "Mega" },
  { symbol: "CVX",   name: "Chevron Corporation",                sector: "Energy", industry: "Oil & Gas Integrated",            marketCap: "Mega" },
  { symbol: "COP",   name: "ConocoPhillips",                     sector: "Energy", industry: "Oil & Gas E&P",                  marketCap: "Large" },
  { symbol: "EOG",   name: "EOG Resources Inc",                  sector: "Energy", industry: "Oil & Gas E&P",                  marketCap: "Large" },
  { symbol: "SLB",   name: "Schlumberger NV",                    sector: "Energy", industry: "Oil & Gas Equipment & Services",  marketCap: "Large" },
  { symbol: "OXY",   name: "Occidental Petroleum Corporation",   sector: "Energy", industry: "Oil & Gas E&P",                  marketCap: "Mid" },
  { symbol: "MPC",   name: "Marathon Petroleum Corporation",     sector: "Energy", industry: "Oil & Gas Refining & Marketing", marketCap: "Large" },
  { symbol: "VLO",   name: "Valero Energy Corporation",          sector: "Energy", industry: "Oil & Gas Refining & Marketing", marketCap: "Mid" },
  { symbol: "PSX",   name: "Phillips 66",                        sector: "Energy", industry: "Oil & Gas Refining & Marketing", marketCap: "Mid" },
  { symbol: "HAL",   name: "Halliburton Company",                sector: "Energy", industry: "Oil & Gas Equipment & Services",  marketCap: "Mid" },
  { symbol: "DVN",   name: "Devon Energy Corporation",           sector: "Energy", industry: "Oil & Gas E&P",                  marketCap: "Mid" },
  { symbol: "FANG",  name: "Diamondback Energy Inc",             sector: "Energy", industry: "Oil & Gas E&P",                  marketCap: "Mid" },
  { symbol: "PXD",   name: "Pioneer Natural Resources Co",       sector: "Energy", industry: "Oil & Gas E&P",                  marketCap: "Large" },
  { symbol: "WMB",   name: "The Williams Companies Inc",         sector: "Energy", industry: "Oil & Gas Midstream",            marketCap: "Mid" },
  { symbol: "KMI",   name: "Kinder Morgan Inc",                  sector: "Energy", industry: "Oil & Gas Midstream",            marketCap: "Mid" },
  { symbol: "OKE",   name: "ONEOK Inc",                          sector: "Energy", industry: "Oil & Gas Midstream",            marketCap: "Mid" },
  { symbol: "BKR",   name: "Baker Hughes Company",               sector: "Energy", industry: "Oil & Gas Equipment & Services",  marketCap: "Mid" },

  // ─────────────────────────────────────────────────────────────────────────────
  // INDUSTRIAL
  // ─────────────────────────────────────────────────────────────────────────────
  { symbol: "GE",    name: "General Electric Company",           sector: "Industrial", industry: "Specialty Industrial Machinery", marketCap: "Large" },
  { symbol: "CAT",   name: "Caterpillar Inc",                    sector: "Industrial", industry: "Farm & Heavy Construction Machinery", marketCap: "Large" },
  { symbol: "BA",    name: "The Boeing Company",                 sector: "Industrial", industry: "Aerospace & Defense",         marketCap: "Large" },
  { symbol: "HON",   name: "Honeywell International Inc",        sector: "Industrial", industry: "Conglomerates",               marketCap: "Large" },
  { symbol: "UNP",   name: "Union Pacific Corporation",          sector: "Industrial", industry: "Railroads",                   marketCap: "Large" },
  { symbol: "RTX",   name: "RTX Corporation",                    sector: "Industrial", industry: "Aerospace & Defense",         marketCap: "Large" },
  { symbol: "DE",    name: "Deere & Company",                    sector: "Industrial", industry: "Farm & Heavy Construction Machinery", marketCap: "Large" },
  { symbol: "UPS",   name: "United Parcel Service Inc",          sector: "Industrial", industry: "Integrated Freight & Logistics", marketCap: "Large" },
  { symbol: "LMT",   name: "Lockheed Martin Corporation",        sector: "Industrial", industry: "Aerospace & Defense",        marketCap: "Large" },
  { symbol: "GD",    name: "General Dynamics Corporation",        sector: "Industrial", industry: "Aerospace & Defense",        marketCap: "Large" },
  { symbol: "NOC",   name: "Northrop Grumman Corporation",       sector: "Industrial", industry: "Aerospace & Defense",        marketCap: "Large" },
  { symbol: "MMM",   name: "3M Company",                         sector: "Industrial", industry: "Conglomerates",               marketCap: "Large" },
  { symbol: "CSX",   name: "CSX Corporation",                    sector: "Industrial", industry: "Railroads",                   marketCap: "Large" },
  { symbol: "ITW",   name: "Illinois Tool Works Inc",            sector: "Industrial", industry: "Specialty Industrial Machinery", marketCap: "Large" },
  { symbol: "EMR",   name: "Emerson Electric Co",                sector: "Industrial", industry: "Specialty Industrial Machinery", marketCap: "Large" },
  { symbol: "NSC",   name: "Norfolk Southern Corporation",       sector: "Industrial", industry: "Railroads",                   marketCap: "Large" },
  { symbol: "FDX",   name: "FedEx Corporation",                  sector: "Industrial", industry: "Integrated Freight & Logistics", marketCap: "Large" },
  { symbol: "WM",    name: "Waste Management Inc",               sector: "Industrial", industry: "Waste Management",            marketCap: "Large" },
  { symbol: "TXT",   name: "Textron Inc",                        sector: "Industrial", industry: "Aerospace & Defense",         marketCap: "Mid" },
  { symbol: "HII",   name: "Huntington Ingalls Industries Inc",  sector: "Industrial", industry: "Aerospace & Defense",        marketCap: "Mid" },
  { symbol: "LHX",   name: "L3Harris Technologies Inc",          sector: "Industrial", industry: "Aerospace & Defense",        marketCap: "Large" },
  { symbol: "GWW",   name: "W.W. Grainger Inc",                  sector: "Industrial", industry: "Industrial Distribution",     marketCap: "Mid" },
  { symbol: "ETN",   name: "Eaton Corporation plc",              sector: "Industrial", industry: "Specialty Industrial Machinery", marketCap: "Large" },
  { symbol: "PCAR",  name: "PACCAR Inc",                         sector: "Industrial", industry: "Farm & Heavy Construction Machinery", marketCap: "Mid" },
  { symbol: "ROK",   name: "Rockwell Automation Inc",            sector: "Industrial", industry: "Specialty Industrial Machinery", marketCap: "Mid" },
  { symbol: "VRSK",  name: "Verisk Analytics Inc",               sector: "Industrial", industry: "Consulting Services",         marketCap: "Mid" },
  { symbol: "CTAS",  name: "Cintas Corporation",                 sector: "Industrial", industry: "Specialty Business Services",  marketCap: "Large" },
  { symbol: "IR",    name: "Ingersoll Rand Inc",                 sector: "Industrial", industry: "Specialty Industrial Machinery", marketCap: "Mid" },

  // ─────────────────────────────────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────────────────────────────────
  { symbol: "NEE",   name: "NextEra Energy Inc",                 sector: "Utilities", industry: "Utilities - Regulated Electric", marketCap: "Large" },
  { symbol: "SO",    name: "The Southern Company",               sector: "Utilities", industry: "Utilities - Regulated Electric", marketCap: "Large" },
  { symbol: "DUK",   name: "Duke Energy Corporation",            sector: "Utilities", industry: "Utilities - Regulated Electric", marketCap: "Large" },
  { symbol: "AEP",   name: "American Electric Power Co Inc",     sector: "Utilities", industry: "Utilities - Regulated Electric", marketCap: "Mid" },
  { symbol: "D",     name: "Dominion Energy Inc",                sector: "Utilities", industry: "Utilities - Regulated Electric", marketCap: "Mid" },
  { symbol: "SRE",   name: "Sempra",                             sector: "Utilities", industry: "Utilities - Diversified",      marketCap: "Mid" },
  { symbol: "EXC",   name: "Exelon Corporation",                 sector: "Utilities", industry: "Utilities - Regulated Electric", marketCap: "Mid" },
  { symbol: "XEL",   name: "Xcel Energy Inc",                    sector: "Utilities", industry: "Utilities - Regulated Electric", marketCap: "Mid" },
  { symbol: "ED",    name: "Consolidated Edison Inc",             sector: "Utilities", industry: "Utilities - Regulated Electric", marketCap: "Mid" },
  { symbol: "WEC",   name: "WEC Energy Group Inc",               sector: "Utilities", industry: "Utilities - Regulated Electric", marketCap: "Mid" },
  { symbol: "AWK",   name: "American Water Works Company Inc",   sector: "Utilities", industry: "Utilities - Regulated Water",  marketCap: "Mid" },
  { symbol: "ES",    name: "Eversource Energy",                  sector: "Utilities", industry: "Utilities - Regulated Electric", marketCap: "Mid" },

  // ─────────────────────────────────────────────────────────────────────────────
  // REAL ESTATE
  // ─────────────────────────────────────────────────────────────────────────────
  { symbol: "PLD",   name: "Prologis Inc",                       sector: "Real Estate", industry: "REIT - Industrial",          marketCap: "Large" },
  { symbol: "AMT",   name: "American Tower Corporation",         sector: "Real Estate", industry: "REIT - Specialty",           marketCap: "Large" },
  { symbol: "CCI",   name: "Crown Castle Inc",                   sector: "Real Estate", industry: "REIT - Specialty",           marketCap: "Large" },
  { symbol: "EQIX",  name: "Equinix Inc",                        sector: "Real Estate", industry: "REIT - Specialty",           marketCap: "Large" },
  { symbol: "SPG",   name: "Simon Property Group Inc",           sector: "Real Estate", industry: "REIT - Retail",              marketCap: "Mid" },
  { symbol: "PSA",   name: "Public Storage",                     sector: "Real Estate", industry: "REIT - Industrial",          marketCap: "Mid" },
  { symbol: "O",     name: "Realty Income Corporation",           sector: "Real Estate", industry: "REIT - Retail",             marketCap: "Mid" },
  { symbol: "WELL",  name: "Welltower Inc",                      sector: "Real Estate", industry: "REIT - Healthcare Facilities", marketCap: "Mid" },
  { symbol: "DLR",   name: "Digital Realty Trust Inc",            sector: "Real Estate", industry: "REIT - Specialty",          marketCap: "Mid" },
  { symbol: "AVB",   name: "AvalonBay Communities Inc",           sector: "Real Estate", industry: "REIT - Residential",       marketCap: "Mid" },
  { symbol: "VICI",  name: "VICI Properties Inc",                 sector: "Real Estate", industry: "REIT - Specialty",         marketCap: "Mid" },

  // ─────────────────────────────────────────────────────────────────────────────
  // BASIC MATERIALS
  // ─────────────────────────────────────────────────────────────────────────────
  { symbol: "LIN",   name: "Linde plc",                          sector: "Basic Materials", industry: "Specialty Chemicals",     marketCap: "Mega" },
  { symbol: "SHW",   name: "The Sherwin-Williams Company",       sector: "Basic Materials", industry: "Specialty Chemicals",     marketCap: "Large" },
  { symbol: "APD",   name: "Air Products and Chemicals Inc",     sector: "Basic Materials", industry: "Specialty Chemicals",     marketCap: "Large" },
  { symbol: "FCX",   name: "Freeport-McMoRan Inc",               sector: "Basic Materials", industry: "Copper",                 marketCap: "Large" },
  { symbol: "ECL",   name: "Ecolab Inc",                         sector: "Basic Materials", industry: "Specialty Chemicals",     marketCap: "Large" },
  { symbol: "NEM",   name: "Newmont Corporation",                sector: "Basic Materials", industry: "Gold",                   marketCap: "Mid" },
  { symbol: "DOW",   name: "Dow Inc",                            sector: "Basic Materials", industry: "Chemicals",               marketCap: "Mid" },
  { symbol: "DD",    name: "DuPont de Nemours Inc",              sector: "Basic Materials", industry: "Specialty Chemicals",     marketCap: "Mid" },
  { symbol: "CTVA",  name: "Corteva Inc",                        sector: "Basic Materials", industry: "Agricultural Inputs",     marketCap: "Mid" },
  { symbol: "NUE",   name: "Nucor Corporation",                  sector: "Basic Materials", industry: "Steel",                   marketCap: "Mid" },
  { symbol: "PPG",   name: "PPG Industries Inc",                 sector: "Basic Materials", industry: "Specialty Chemicals",     marketCap: "Mid" },
  { symbol: "ALB",   name: "Albemarle Corporation",              sector: "Basic Materials", industry: "Specialty Chemicals",     marketCap: "Mid" },
  { symbol: "VMC",   name: "Vulcan Materials Company",           sector: "Basic Materials", industry: "Building Materials",      marketCap: "Mid" },
  { symbol: "MLM",   name: "Martin Marietta Materials Inc",      sector: "Basic Materials", industry: "Building Materials",      marketCap: "Mid" },
];

/**
 * All sector names used in the database.
 */
const SECTORS = [
  "Technology",
  "Healthcare",
  "Finance",
  "Consumer Cyclical",
  "Consumer Defensive",
  "Energy",
  "Industrial",
  "Communication",
  "Real Estate",
  "Utilities",
  "Basic Materials",
];

/**
 * Market-cap tiers.
 */
const MARKET_CAPS = ["Mega", "Large", "Mid", "Small"];

// ─── Pre-built lookup maps for O(1) access ──────────────────────────────────

const _symbolMap = {};
STOCKS.forEach((stock) => {
  _symbolMap[stock.symbol.toUpperCase()] = stock;
});

const _sectorMap = {};
STOCKS.forEach((stock) => {
  if (!_sectorMap[stock.sector]) {
    _sectorMap[stock.sector] = [];
  }
  _sectorMap[stock.sector].push(stock);
});

// ─── Exported helper functions ───────────────────────────────────────────────

/**
 * Search stocks by symbol or company name.
 * - Case-insensitive
 * - Symbol prefix matches are ranked higher than name substring matches
 * - Returns the top 15 matches
 *
 * @param {string} query - The search string.
 * @returns {Array} Up to 15 matching stock objects.
 */
function searchStocks(query) {
  if (!query || typeof query !== "string") return [];

  const q = query.trim().toUpperCase();
  if (q.length === 0) return [];

  const symbolPrefixMatches = [];
  const nameMatches = [];

  for (let i = 0; i < STOCKS.length; i++) {
    const stock = STOCKS[i];
    const symbolUpper = stock.symbol.toUpperCase();
    const nameUpper = stock.name.toUpperCase();

    if (symbolUpper.startsWith(q)) {
      // Exact symbol match goes to the very front
      if (symbolUpper === q) {
        symbolPrefixMatches.unshift(stock);
      } else {
        symbolPrefixMatches.push(stock);
      }
    } else if (nameUpper.includes(q)) {
      nameMatches.push(stock);
    }
  }

  return [...symbolPrefixMatches, ...nameMatches].slice(0, 15);
}

/**
 * Get a single stock by its exact ticker symbol (case-insensitive).
 *
 * @param {string} symbol - Ticker symbol, e.g. "AAPL".
 * @returns {Object|undefined} The stock object, or undefined if not found.
 */
function getStockBySymbol(symbol) {
  if (!symbol || typeof symbol !== "string") return undefined;
  return _symbolMap[symbol.trim().toUpperCase()];
}

/**
 * Get all stocks belonging to a given sector.
 *
 * @param {string} sector - Sector name, e.g. "Technology".
 * @returns {Array} Array of stock objects in that sector (empty array if none).
 */
function getStocksBySector(sector) {
  if (!sector || typeof sector !== "string") return [];
  // Try exact match first
  if (_sectorMap[sector]) return _sectorMap[sector];
  // Fall back to case-insensitive match
  const key = Object.keys(_sectorMap).find(
    (k) => k.toLowerCase() === sector.trim().toLowerCase()
  );
  return key ? _sectorMap[key] : [];
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export {
  STOCKS,
  SECTORS,
  MARKET_CAPS,
  searchStocks,
  getStockBySymbol,
  getStocksBySector,
};
