const routesArray = [
    `dashboard`,
    `users`,
    `about-details`,
    `menus`,
    `permissions`,
    `roles`,
    `brands`,
    `banners`,
    `categories`,
    `sub-categories`,
    `discounts`,
    `colors`,
    `tags`,
    `products`,
    `social-details`,
    `terms-and-conditions`,
    `faqs`,
    `support-details`,
    `about-us`,
    `services`,
    `news-letters`,
    `return-policies`,
    `messages`,
    `like-lists`,
    `wish-lists`,
    `carts`,
    `orders`,
    `units`,
    `warranties`,
    `coupons`,
    `warehouses`,
    `stores`,
    `errors`,
    `settings`,
    `countries`,
];

let router = [];

router.push({ path: `/`, module: require(`./backend/auths`) });

routesArray.forEach((value) => {
    const newValue = value.replaceAll(`-`, `_`);
    router.push({ path: `/${value}`, module: require(`./backend/${newValue}`) });
});

module.exports = router;