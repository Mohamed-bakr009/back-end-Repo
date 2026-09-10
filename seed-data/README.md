# بيانات جاهزة (seed data)

مفيش سكريبت seed.js بيولد بيانات وقت التشغيل — دي بيانات جاهزة (JSON) بتتحمل في الداتا بيز نفسها مباشرة باستخدام mongoimport.

## طريقة الاستخدام
1. تأكد إن mongod شغال، و MONGO_URI في .env مظبوط.
2. من مجلد Back شغّل:
   ```bash
   ./import-data.sh
   ```
   (أو حدد اسم الداتا بيز: `./import-data.sh myDbName`)

## اللي هيتحط في الداتا بيز
- users: أدمن واحد → username: `mohamed` / password: `12345678`
- categories: رجالي، حريمي
- subcategories: 6 (تيشيرت/بنطلون/هودي لكل قسم + فستان لحريمي)
- seasons: كل المواسم
- shippingfees: القاهرة والجيزة (40)، باقي المحافظات (65)
- policies: shipping, return, privacy, terms, about
- products: 12 منتج بصور وأسعار وslugs جاهزة (منتج واحد stock=0 لاختبار حالة "خلصت الكمية")
- testimonials: رأيين معتمدين (approved) يظهروا على الموقع فورًا

كل `_id` في الملفات دي ثابت ومترابط صح (المنتجات بتشاور على الـ category/subcategory/season الصح بنفس الـ ObjectId)، فمينفعش تستورد جزء لوحده من غير الباقي.
