-- Migration 006: Create get_category_counts() function and populate comparisons + best-of lists

-- ============================================================
-- Postgres function for accurate category counts
-- ============================================================
CREATE OR REPLACE FUNCTION get_category_counts()
RETURNS TABLE (category_id UUID, count BIGINT)
LANGUAGE sql
STABLE
AS $$
  SELECT category_id, COUNT(*) as count
  FROM companies
  WHERE category_id IS NOT NULL
  GROUP BY category_id;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION get_category_counts() TO anon;
GRANT EXECUTE ON FUNCTION get_category_counts() TO authenticated;

-- ============================================================
-- Populate comparisons table
-- ============================================================

-- binance-vs-coinbase and ledger-nano-x-vs-trezor-model-t already exist from seed

-- kraken-vs-coinbase
INSERT INTO comparisons (company_a_id, company_b_id, slug)
SELECT c1.id, c2.id, 'kraken-vs-coinbase'
FROM companies c1, companies c2
WHERE c1.slug = 'kraken' AND c2.slug = 'coinbase';

-- binance-vs-kraken
INSERT INTO comparisons (company_a_id, company_b_id, slug)
SELECT c1.id, c2.id, 'binance-vs-kraken'
FROM companies c1, companies c2
WHERE c1.slug = 'binance' AND c2.slug = 'kraken';

-- bybit-vs-okx
INSERT INTO comparisons (company_a_id, company_b_id, slug)
SELECT c1.id, c2.id, 'bybit-vs-okx'
FROM companies c1, companies c2
WHERE c1.slug = 'bybit' AND c2.slug = 'okx';

-- koinly-vs-cointracking
INSERT INTO comparisons (company_a_id, company_b_id, slug)
SELECT c1.id, c2.id, 'koinly-vs-cointracking'
FROM companies c1, companies c2
WHERE c1.slug = 'koinly' AND c2.slug = 'cointracking';

-- koinly-vs-coinledger
INSERT INTO comparisons (company_a_id, company_b_id, slug)
SELECT c1.id, c2.id, 'koinly-vs-coinledger'
FROM companies c1, companies c2
WHERE c1.slug = 'koinly' AND c2.slug = 'coinledger';

-- 3commas-vs-pionex
INSERT INTO comparisons (company_a_id, company_b_id, slug)
SELECT c1.id, c2.id, '3commas-vs-pionex'
FROM companies c1, companies c2
WHERE c1.slug = '3commas' AND c2.slug = 'pionex';

-- ledger-nano-x-vs-keystone-pro-3
INSERT INTO comparisons (company_a_id, company_b_id, slug)
SELECT c1.id, c2.id, 'ledger-nano-x-vs-keystone-pro-3'
FROM companies c1, companies c2
WHERE c1.slug = 'ledger-nano-x' AND c2.slug = 'keystone-pro-3';

-- ledger-nano-x-vs-trezor-safe-3
INSERT INTO comparisons (company_a_id, company_b_id, slug)
SELECT c1.id, c2.id, 'ledger-nano-x-vs-trezor-safe-3'
FROM companies c1, companies c2
WHERE c1.slug = 'ledger-nano-x' AND c2.slug = 'trezor-safe-3';

-- nicehash-vs-compass-mining
INSERT INTO comparisons (company_a_id, company_b_id, slug)
SELECT c1.id, c2.id, 'nicehash-vs-compass-mining'
FROM companies c1, companies c2
WHERE c1.slug = 'nicehash' AND c2.slug = 'compass-mining';

-- uniswap-vs-dydx
INSERT INTO comparisons (company_a_id, company_b_id, slug)
SELECT c1.id, c2.id, 'uniswap-vs-dydx'
FROM companies c1, companies c2
WHERE c1.slug = 'uniswap' AND c2.slug = 'dydx';

-- metamask-vs-trust-wallet
INSERT INTO comparisons (company_a_id, company_b_id, slug)
SELECT c1.id, c2.id, 'metamask-vs-trust-wallet'
FROM companies c1, companies c2
WHERE c1.slug = 'metamask' AND c2.slug = 'trust-wallet';

-- ============================================================
-- Expand best_of_items for existing lists + create new lists
-- ============================================================

-- Add more companies to existing best-of lists

-- Best Crypto Exchanges: add Kraken, Bybit, Gemini, KuCoin
INSERT INTO best_of_items (list_id, company_id, rank, blurb)
SELECT
  (SELECT id FROM best_of_lists WHERE slug = 'best-crypto-exchanges'),
  id,
  CASE
    WHEN slug = 'kraken' THEN 4
    WHEN slug = 'bybit' THEN 5
    WHEN slug = 'gemini' THEN 6
    WHEN slug = 'kucoin' THEN 7
  END,
  CASE
    WHEN slug = 'kraken' THEN 'Best for security-conscious traders who value trust and low fees'
    WHEN slug = 'bybit' THEN 'Top choice for derivatives and high-leverage trading'
    WHEN slug = 'gemini' THEN 'Best regulated US exchange with insurance coverage'
    WHEN slug = 'kucoin' THEN 'Best for discovering new altcoins early'
  END
FROM companies WHERE slug IN ('kraken', 'bybit', 'gemini', 'kucoin');

-- Best Hardware Wallets: add Ledger Nano S Plus, Trezor Safe 3, CoolWallet Pro, SafePal S1, Keystone Pro 3
INSERT INTO best_of_items (list_id, company_id, rank, blurb)
SELECT
  (SELECT id FROM best_of_lists WHERE slug = 'best-hardware-wallets'),
  id,
  CASE
    WHEN slug = 'ledger-nano-s-plus' THEN 3
    WHEN slug = 'trezor-safe-3' THEN 4
    WHEN slug = 'coolwallet-pro' THEN 5
    WHEN slug = 'keystone-pro-3' THEN 6
    WHEN slug = 'safepal-s1' THEN 7
  END,
  CASE
    WHEN slug = 'ledger-nano-s-plus' THEN 'Best value Ledger with the same security as Nano X'
    WHEN slug = 'trezor-safe-3' THEN 'Best budget open-source wallet with Secure Element'
    WHEN slug = 'coolwallet-pro' THEN 'Best portable wallet with credit card form factor'
    WHEN slug = 'keystone-pro-3' THEN 'Best air-gapped wallet with QR code signing'
    WHEN slug = 'safepal-s1' THEN 'Best budget air-gapped wallet backed by Binance'
  END
FROM companies WHERE slug IN ('ledger-nano-s-plus', 'trezor-safe-3', 'coolwallet-pro', 'keystone-pro-3', 'safepal-s1');

-- Best Crypto Tax Software: add CoinLedger, Crypto Tax Calculator, TokenTax
INSERT INTO best_of_items (list_id, company_id, rank, blurb)
SELECT
  (SELECT id FROM best_of_lists WHERE slug = 'best-crypto-tax-software'),
  id,
  CASE
    WHEN slug = 'coinledger' THEN 3
    WHEN slug = 'crypto-tax-calculator' THEN 4
    WHEN slug = 'tokentax' THEN 5
  END,
  CASE
    WHEN slug = 'coinledger' THEN 'Best for beginners with intuitive interface and TurboTax integration'
    WHEN slug = 'crypto-tax-calculator' THEN 'Best multi-country tax support with excellent DeFi handling'
    WHEN slug = 'tokentax' THEN 'Best for complex portfolios needing CPA support'
  END
FROM companies WHERE slug IN ('coinledger', 'crypto-tax-calculator', 'tokentax');

-- ============================================================
-- Create new best-of lists
-- ============================================================

-- Best Trading Bots
INSERT INTO best_of_lists (title, slug, description, category_id, is_published, order_index) VALUES
('Best Trading Bots 2026', 'best-trading-bots', 'Automate your crypto trading with the top-rated trading bot platforms. We evaluate strategy options, exchange support, and ease of use.', (SELECT id FROM categories WHERE slug = 'trading-bots'), true, 4);

INSERT INTO best_of_items (list_id, company_id, rank, blurb)
SELECT
  (SELECT id FROM best_of_lists WHERE slug = 'best-trading-bots'),
  id,
  CASE
    WHEN slug = 'pionex' THEN 1
    WHEN slug = '3commas' THEN 2
    WHEN slug = 'bitsgap' THEN 3
    WHEN slug = 'cryptohopper' THEN 4
    WHEN slug = 'tradesanta' THEN 5
  END,
  CASE
    WHEN slug = 'pionex' THEN 'Best overall with 16 free built-in bots and low trading fees'
    WHEN slug = '3commas' THEN 'Best multi-exchange bot with DCA and grid strategies'
    WHEN slug = 'bitsgap' THEN 'Best interface for multi-exchange portfolio management'
    WHEN slug = 'cryptohopper' THEN 'Best cloud-based bot with strategy marketplace'
    WHEN slug = 'tradesanta' THEN 'Best for beginners with simple pre-built strategies'
  END
FROM companies WHERE slug IN ('pionex', '3commas', 'bitsgap', 'cryptohopper', 'tradesanta');

-- Best Cloud Mining
INSERT INTO best_of_lists (title, slug, description, category_id, is_published, order_index) VALUES
('Best Cloud Mining 2026', 'best-cloud-mining', 'Start mining cryptocurrency without hardware. Compare the top cloud mining and hashrate marketplace platforms.', (SELECT id FROM categories WHERE slug = 'cloud-mining'), true, 5);

INSERT INTO best_of_items (list_id, company_id, rank, blurb)
SELECT
  (SELECT id FROM best_of_lists WHERE slug = 'best-cloud-mining'),
  id,
  CASE
    WHEN slug = 'nicehash' THEN 1
    WHEN slug = 'compass-mining' THEN 2
    WHEN slug = 'ecos' THEN 3
    WHEN slug = 'bemine' THEN 4
  END,
  CASE
    WHEN slug = 'nicehash' THEN 'Best hash rate marketplace for flexible mining power'
    WHEN slug = 'compass-mining' THEN 'Best full-service mining infrastructure and hosting'
    WHEN slug = 'ecos' THEN 'Best long-term Bitcoin cloud mining contracts'
    WHEN slug = 'bemine' THEN 'Best fractional ASIC ownership model'
  END
FROM companies WHERE slug IN ('nicehash', 'compass-mining', 'ecos', 'bemine');

-- Best DeFi Tools
INSERT INTO best_of_lists (title, slug, description, category_id, is_published, order_index) VALUES
('Best DeFi Tools 2026', 'best-defi-tools', 'Essential decentralized finance tools for security, yield optimization, and asset management.', (SELECT id FROM categories WHERE slug = 'defi-tools'), true, 6);

INSERT INTO best_of_items (list_id, company_id, rank, blurb)
SELECT
  (SELECT id FROM best_of_lists WHERE slug = 'best-defi-tools'),
  id,
  CASE
    WHEN slug = 'lido' THEN 1
    WHEN slug = 'revoke-cash' THEN 2
    WHEN slug = 'fireblocks' THEN 3
  END,
  CASE
    WHEN slug = 'lido' THEN 'Best liquid staking protocol for Ethereum and PoS chains'
    WHEN slug = 'revoke-cash' THEN 'Essential free security tool for managing token approvals'
    WHEN slug = 'fireblocks' THEN 'Best institutional-grade digital asset security platform'
  END
FROM companies WHERE slug IN ('lido', 'revoke-cash', 'fireblocks');