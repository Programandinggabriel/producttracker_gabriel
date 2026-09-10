const readLine = require('readline');
const { createDbUser, assingUserRole } = require('../../src/models/user');
const { getRoleByName } = require('../../src/models/role');

const createUser = async (username, password) => {
    const objUser = {
        name: 'User admin',
        email: null,
        password: password,
        username : username
    }

    const newUser = await createDbUser(objUser);

    const roleAdmin = await getRoleByName('admin');

    await assingUserRole(
        roleAdmin.id,
        newUser.id
    )

    if(newUser){
        console.log('Usuario admin creado')
    }else{
        console.log('No se pudo crear el usuario')
    }
}


const main = async() => {
    try{
        const rl = readLine.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const askQuestion = (question) => {
            return new Promise((resolve, reject) => {
                rl.question(question, (res) => {
                    resolve(res)
                })
            })
        }

        let notIsnull = false;
        let username = null;
        let password = null;

        while(!notIsnull){
            username = await askQuestion('Nombre de usuario: ')
            if (username !== ''){
                notIsnull = true
            }
        }

        notIsnull = false

        while(!notIsnull){
            password = await askQuestion('Contraseña: ')
            if (username !== ''){
                notIsnull = true
            }
        }

        await createUser(username, password)
    }catch(error){
        console.log('Error al crear usuario admin', error)
    }

    process.exit()
}

main()