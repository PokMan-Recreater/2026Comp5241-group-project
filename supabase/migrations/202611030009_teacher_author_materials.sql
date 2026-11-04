-- Teacher source material is private drafting state, not part of the published
-- snapshot students can read.
alter table public.teaching_courses add column if not exists author_materials text not null default '' check(length(author_materials)<=16000);
