# Free deployment: Render + Neon + Cloudinary

The Render blueprint hosts React and Express together at one HTTPS URL.
Local development continues to use the existing DB_* settings and local images.

1. Push these changes to GitHub.
2. In Render choose New > Blueprint and connect this repository. Use render.yaml.
3. Set DATABASE_URL to the connection string from Neon Connect, retaining its SSL parameters.
4. Set CLOUDINARY_URL to the API environment variable from Cloudinary API Keys (cloudinary://KEY:SECRET@CLOUD_NAME). Never commit these values.
5. Deploy the free service. The start command creates the hotels table without deleting existing data.
6. The online database starts empty. Add hotels using the form, or run backend/src/config/seed.sql ONCE in the Neon SQL editor to load the sample dataset. Bundled sample images are served from the repo. Do not rerun the seed script on existing data.
7. Verify adding, editing, deleting, images, searching, pagination, and the map on the public URL.

Render free services sleep after inactivity, so the first visit can be slow. Cloud uploads survive server restarts. Existing local uploads and local database records are not automatically migrated.

This assignment has no authentication: anyone with the URL can add, edit and delete listings. Use demonstration data only.
