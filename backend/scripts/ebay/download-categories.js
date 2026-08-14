require('dotenv').config()
const { mkdir, writeFile } = require('fs/promises')
const path = require('path')

const ebayAuth = require('../../src/providers/ebay/auth')

const EBAY_API_URL = process.env.EBAY_API
const MARKETPLACE_ID = process.env.EBAY_MARKETPLACE_ID;

const DATA_DIR = path.resolve("data");
const OUTPUT_FILE = path.join(
  DATA_DIR,
  "ebay-categories.json"
);

async function getCategoryTreeId(token) {
  const url =
    `${EBAY_API_URL}/commerce/taxonomy/v1/` +
    `get_default_category_tree_id` +
    `?marketplace_id=${MARKETPLACE_ID}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if(response.status === 401){
        const newToken = await ebayAuth.refreshEbayAccessToken()
        getCategoryTreeId(token)
    }

    const error = await response.text();

    throw new Error(
      `Error obteniendo category tree ID ` +
      `(${response.status}): ${error}`
    );
  }

  return response.json();
}

async function getCategoryTree(token, categoryTreeId) {
  const url =
    `${EBAY_API_URL}/commerce/taxonomy/v1/` +
    `category_tree/${categoryTreeId}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if(response.status === 401){
        const newToken = await ebayAuth.refreshEbayAccessToken()
        getCategoryTree(token, categoryTreeId)
    }

    const error = await response.text();

    throw new Error(
      `Error obteniendo category tree ` +
      `(${response.status}): ${error}`
    );
  }

  return response.json();
}

async function main() {
  try {
    console.log("Obteniendo token de eBay...");

    const token = await ebayAuth.getEbayAccessToken();

    console.log("Obteniendo category tree ID...");

    const {
      categoryTreeId,
      categoryTreeVersion,
    } = await getCategoryTreeId(token);

    console.log(`   Tree ID: ${categoryTreeId}`);
    console.log(`   Version: ${categoryTreeVersion}`);

    console.log("Descargando árbol de categorías...");

    const tree = await getCategoryTree(
      token,
      categoryTreeId
    );

    await mkdir(DATA_DIR, {
      recursive: true,
    });

    const data = {
      marketplaceId: MARKETPLACE_ID,
      categoryTreeId,
      categoryTreeVersion,
      downloadedAt: new Date().toISOString(),
      tree,
    };

    await writeFile(
      OUTPUT_FILE,
      JSON.stringify(data, null, 2),
      "utf8"
    );

    console.log("");
    console.log("✅ Árbol de categorías guardado.");
    console.log(`📁 ${OUTPUT_FILE}`);
    console.log("");
  } catch (error) {
    console.error("");
    console.error("❌ Error:", error.message);
    console.error("");

    process.exit(1);
  }
}

main();