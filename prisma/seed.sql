INSERT OR IGNORE INTO User (email, password, name, role, createdAt) VALUES ('admin@tstbhf.org.tr', '$2b$10$mJhg8reWFkpDR7obLeloDOOWOIXlQLF0yob3JOov13vnNagrif27S', 'Sistem Yonetici', 'superadmin', datetime('now'));
INSERT OR IGNORE INTO Category (name, slug) VALUES ('Haberler', 'haberler');
INSERT OR IGNORE INTO Category (name, slug) VALUES ('Duyurular', 'duyurular');
INSERT OR IGNORE INTO Category (name, slug) VALUES ('Etkinlikler', 'etkinlikler');