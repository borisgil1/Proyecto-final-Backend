class UserDTO {
    constructor(first_name, last_name, role, cart, age, email) {
        this.name = first_name;
        this.last_name = last_name;
        this.role = role;
        this.cart = cart;
        this.age = age;
        this.email = email;
    }
}

module.exports = UserDTO;