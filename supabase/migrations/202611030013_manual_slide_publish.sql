-- Hand-authored lessons carry their content in slides, so a published lesson
-- with a slide deck no longer needs a separate body paragraph.
create or replace function public.teaching_course_write() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if TG_OP='INSERT' then
  new.revision:=1; new.published:=null;
 else
  if new.id<>old.id or new.teacher_id<>old.teacher_id or new.revision<>old.revision+1 then raise exception 'revision_conflict'; end if;
  if new.published is distinct from old.published then
   if new.published is distinct from old.draft then raise exception 'publish_draft_first'; end if;
   if exists(select 1 from jsonb_array_elements(new.published->'lessons') l where length(btrim(l->>'body'))=0 and not (l ? 'slides')) then raise exception 'lesson_body_required'; end if;
  end if;
 end if;
 new.title:=new.draft->>'title';new.description:=new.draft->>'description';new.language:=new.draft->>'language';new.updated_at:=now();return new;
end $$;
