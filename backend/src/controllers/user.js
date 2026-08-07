const userService = require('../services/user');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const userToken = await userService.login(username, password);
        res.json({ token: userToken });
    } catch (error) {
        res.status(401).send();
    }
}

const getUser = async(req, res) => {
  try {
    const users = await userService.getUser();
    res.json(users);
  } catch (error) {
    res.status(500).send();
  }
};

const createUser = async (req, res) => {
    try {
        const newUser = await userService.createUser(req.body);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).send();
    }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await userService.updateUser(id, req.body);
    res.json(updatedUser);
  } catch (error) {
    res.status(400).send();
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);
    res.json({ message: `User with ID: ${id} deleted` });
  } catch (error) {
    res.status(400).send();
  }
};


const resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        const resetUserPassword = await userService.resetPassword(email, password);
        res.json(resetUserPassword);
    } catch (error) {
        res.status(400).send();
    }
};

module.exports = {
    login,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    resetPassword
}