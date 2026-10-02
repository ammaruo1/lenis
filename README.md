# الجيل العربي الرقمي

موقع عربي/إنجليزي للأجهزة والتجهيزات والحلول التقنية، مبني على React وTypeScript وVite.

## التشغيل

```sh
npm install
npm run dev
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

## التصميم والحركة

- العربية افتراضيًا؛ اللغة والمظهر محفوظان محليًا.
- GSAP وScrollTrigger: دخول متدرج، عمق في المشهد الرئيسي، وتجميع منتجات خلال مشهد مثبت على الكمبيوتر.
- تحت عرض 900 بكسل يتحول المشهد إلى تمرير طبيعي دون تثبيت. احترام إعداد تقليل الحركة في النظام.
- Lenis للتمرير مع حلقة واحدة تُنظف عند الإزالة؛ تمرير اللمس يبقى طبيعيًا.
- Radix للتبويبات وحوار معلومات الموقع؛ القائمة تدير التركيز وتدعم Escape.
- صور WebP محلية؛ سجل المصادر في `public/images/sources.json`. الشاشة مركبة من صورة العتاد وصورة الشاشة الأصليتين.
- نموذج الاحتياج ينسخ الملخص محليًا. لم يُربط بإرسال خارجي لعدم توفر بيانات التواصل الفعلية للمحل.

التوثيق البصري ونتائج الاختبار في `review/REVIEW.md`.

## نظام الإدارة — المرحلة A

مساحات العمل `server/` و`admin/` و`packages/shared/` داخل هذا المستودع. المتجر في `src/`، وواجهة الإدارة منفصلة تحت `/admin/`. لم يُعدّل تصميم المتجر أو الحركات لهذه المرحلة.

```sh
npm install
npm run env:init
npm run db:generate
docker compose -f docker-compose.dev.yml up --build
docker compose -f docker-compose.dev.yml exec -it api npm run seed:owner
```

افتح `http://localhost:5174/admin/`. أمر إنشاء المالك تفاعلي دون حساب أو كلمة مرور افتراضية، ويلزم تغيير كلمة المرور عند أول دخول. تفعيل التحقق بخطوتين اختياري في المرحلة A. البيانات التجارية لا تُعبّأ تلقائيًا.

للتطوير المحلي واختبارات قاعدة البيانات وخيارات الأمان راجع [دليل الأساس](docs/admin-foundation.md)، [خطة A](docs/ADMIN-PLAN-A.md)، [تقرير A](docs/ADMIN-REPORT-A.md) و[سجل التغييرات](docs/ADMIN-CHANGELOG.md).

```sh
npm run build:all
npm run typecheck
npm run lint
npm test
npm run test:ui
```
