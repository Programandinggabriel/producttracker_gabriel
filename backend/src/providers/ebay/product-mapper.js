const { Product } = require('../../models/product')

function mapEbayProduct ( { item, category }) {
    const images = [];

    //Add first thumbnail images
    if (Array.isArray(item.thumbnailImages)) {
        for (const image of item.thumbnailImages){
            if (image.imageUrl){
                images.push(image.imageUrl)
            }
        }
    }

    //Add second image principal
    if (item.image?.imageUrl) {
        images.push(item.image.imageUrl);
    }

    //Add third images additional
    if (Array.isArray(item.additionalImages)) {
        for (const image of item.additionalImages) {
            if (image.imageUrl) {
                images.push(image.imageUrl);
            }
        }
    }

    return new Product({
        productId: item.itemId,
        providerId: "ebay",
        title: item.title || "",
        description:
            item.shortDescription ||
            item.description ||
            item.title ||
            "",
        price: Number(item.price?.value || 0),
        currency: item.price?.currency,
        images,
        url: item.itemWebUrl || "",
        category: category,
        aviable: true,
    });
}

module.exports = mapEbayProduct