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
    const idProduct = req.params.idProd;
    const idUser = req.user.id
    
    const newFav = await  userService.createProductFavorite(idProduct, idUser);
    res.json(newFav)
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


module.exports = {
    login,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    createProductFavorite,
    getProductFavorite
}