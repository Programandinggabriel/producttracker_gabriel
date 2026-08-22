const userService = require('../services/user');

const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const userToken = await userService.login(username, password);
        res.json({ token: userToken });
    } catch (error) {
        next(error);
    }
}

const getUser = async(req, res, next) => {
  try {
    const users = await userService.getUser();
    res.json(users);
  } catch (error) {
    next(error)
  }
};

const createUser = async (req, res, next) => {
    try {
        const newUser = await userService.createUser(req.body);
        res.status(201).json(newUser);
    } catch (error) {
        next(error)
    }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedUser = await userService.updateUser(id, req.body);
    res.json(updatedUser);
  } catch (error) {
    next(error)
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await userService.deleteUser(id);
    
    res.json({ message: `User with ID: ${id} deleted` });
  } catch (error) {
    next(error)
  }
};


const resetPassword = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const resetUserPassword = await userService.resetPassword(email, password);
        res.json(resetUserPassword);
    } catch (error) {
        next(error)
    }
};

//Favorites
const createProductFavorite = async(req, res, next) => {
  try{
    const { provider, external_id } = req.body;
    const idUser = req.user.id
    
    const newProducFav = await  userService.createProductFavorite(idUser, provider, external_id);
    
    res.status(201).json(newProducFav)
  }catch(error){
    next(error)
  }
}

const getProductFavorite = async (req, res, next) => {
  try{
    const idUser = req.user.id
    const allUsrFav = await userService.getProductFavorite(idUser);
    
    res.json(allUsrFav)
  }catch(error){
    next(error)
  }
}

const deleteProductFavorite = async(req, res, next) => {
  try{
    const idUser = req.user.id;
    const { idProd } = req.params;
    
    const deleted = await userService.deleteProductFavorite(idUser, idProd)
    
    res.status(200).json({ message: `Product favorite with ID: ${idProd} deleted` });
  }catch(error){
    next(error)
  }
}

//Price alerts
const getPriceAlerts = async(req, res, next) => {
  try{
    const idUser = req.user.id;

    const userAlerts = await userService.getPriceAlerts(idUser);

    res.status(200).json(userAlerts)

  }catch(error){
    next(error)
  }
}

const createPriceAlert = async(req, res, next) => {
  try{
    const idUser = req.user.id;
    const { 
      provider, 
      external_id,
      direction,
      price_target
    } = req.body;

    const newAlert = await userService.createPriceAlert(
      idUser,
      provider,
      external_id,
      direction,
      price_target
    );

    res.status(201).json(newAlert)

  }catch(error){
    next(error)
  }
}

const updatePriceAlert = async(req, res, next) => {
  try{
    const idUser = req.user.id;
    const { idAlert } = req.params;
    const { 
      direction,
      price_target,
      active
    } = req.body;

    const updatedAlert = await userService.updatePriceAlert(
      idUser,
      idAlert,
      price_target,
      direction,
      active
    )

    res.status(200).json(updatedAlert)
  }catch(error){
    next(error)
  }
}

const deletePriceAlert = async (req, res, next) => {
  try{
    const idUser = req.user.id;
    const { idAlert } = req.params;
    
    const deleted = await userService.deletePriceAlert(
      idUser, idAlert
    )
    
    res.status(200).json({ message: `Price Alert with ID: ${idAlert} deleted` });
  }catch(error){
    next(error)
  }
}

module.exports = {
    login,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    createProductFavorite,
    getProductFavorite,
    deleteProductFavorite,
    getPriceAlerts,
    createPriceAlert,
    updatePriceAlert,
    deletePriceAlert
}