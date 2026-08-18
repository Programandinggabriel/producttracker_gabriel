const dbProvider = require('../../models/provider')
const EbayAuthToken = require("ebay-oauth-nodejs-client"); 
const { ThrowError } = require('../../errors/AppError')

require("dotenv").config();

const getEbayAccessToken = async () => {
  const { token } = await dbProvider.getProviderToken('ebay')
  
  if(!token){
    return await refreshEbayAccessToken()
  }

  return token
}

const refreshEbayAccessToken = async () => {
  const ebayAuth = new EbayAuthToken({ 
    clientId: process.env.EBAY_CLIENT_ID,
    clientSecret: process.env.EBAY_CLIENT_SECRET
  });

  const response = JSON.parse(
    await ebayAuth.getApplicationToken('PRODUCTION')
  )

  if (!response.access_token){
    throw new Error("eBay no devolvió access_token");
  }

  const tokenData = { 
    accessToken: response.access_token, 
    expiresIn: Number(response.expires_in), 
    expiresAt: Date.now() + Math.max(Number(response.expires_in) - 60, 0) * 1000 
  };

  await dbProvider.updateProviderToken('ebay', tokenData.accessToken)
  console.log('Solicitando nuevo token a ebay')

  return tokenData.accessToken
}

module.exports = {
  getEbayAccessToken,
  refreshEbayAccessToken
};