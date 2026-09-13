
CREATE POLICY "authenticated can upload resumes" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'resumes');
CREATE POLICY "authenticated can read resumes" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'resumes');
CREATE POLICY "authenticated can update resumes" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'resumes');
