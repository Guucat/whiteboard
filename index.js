function Person(name, age) {
  this.name = name;
  this.age = age;
  this.sayName = () => {
    console.log(this.name);
  };
}
const p1 = new Person("ljy", 9);
const p2 = new Person("xxx", 33);
console.log("p1", p1);
console.log("p2", p2);
p1.sayName();
