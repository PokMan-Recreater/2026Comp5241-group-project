-- Extends the shared scene vocabulary with story-style preset templates.
-- Keep the scene list here identical to scripts/teaching-scenes.mjs.
create or replace function public.teaching_valid_course(c jsonb) returns boolean language plpgsql immutable
set search_path = '' as $$
declare l jsonb; q jsonb; s jsonb; sl jsonb; art jsonb; ids text[] := '{}'; question_ids text[]; v text;
begin
 if jsonb_typeof(c)<>'object' or not (c ?& array['title','description','language','lessons']) or
 exists(select 1 from jsonb_object_keys(c) k where k not in ('title','description','language','lessons')) then return false; end if;
 if jsonb_typeof(c->'title')<>'string' or length(btrim(c->>'title')) not between 1 and 180 or
 jsonb_typeof(c->'description')<>'string' or length(c->>'description')>3000 or
 c->>'language' not in ('en','zh-CN','zh-TW') or jsonb_typeof(c->'language')<>'string' or
 jsonb_typeof(c->'lessons')<>'array' or jsonb_array_length(c->'lessons') not between 1 and 10 then return false; end if;
 for l in select * from jsonb_array_elements(c->'lessons') loop
  if jsonb_typeof(l)<>'object' or not (l ?& array['id','title','body','scene','sceneItems','questions']) or
  exists(select 1 from jsonb_object_keys(l) k where k not in ('id','title','body','slides','scene','sceneItems','questions')) then return false; end if;
  v:=l->>'id'; if jsonb_typeof(l->'id')<>'string' or length(v) not between 1 and 80 or v !~ '^[A-Za-z0-9_-]+$' or v=any(ids) then return false; end if; ids:=array_append(ids,v);
  if jsonb_typeof(l->'title')<>'string' or length(btrim(l->>'title')) not between 1 and 180 or
  jsonb_typeof(l->'body')<>'string' or length(l->>'body')>18000 or
  jsonb_typeof(l->'scene')<>'string' or l->>'scene' not in ('auto','flow','compare','timeline','cycle','layers','hub','decision','balance','network','chain','conversation','phone','document','database','robot') or
  jsonb_typeof(l->'sceneItems')<>'array' or jsonb_array_length(l->'sceneItems') not between 1 and 5 or
  jsonb_typeof(l->'questions')<>'array' or jsonb_array_length(l->'questions')>5 then return false; end if;
  for s in select * from jsonb_array_elements(l->'sceneItems') loop
   if jsonb_typeof(s)<>'string' or length(btrim(s #>> '{}')) not between 1 and 60 then return false; end if;
  end loop;
  if l ? 'slides' then
   if jsonb_typeof(l->'slides')<>'array' or jsonb_array_length(l->'slides') not between 1 and 20 then return false; end if;
   for sl in select * from jsonb_array_elements(l->'slides') loop
    if jsonb_typeof(sl)<>'object' or not (sl ?& array['heading','bullets','art']) or
    exists(select 1 from jsonb_object_keys(sl) k where k not in ('heading','bullets','art')) then return false; end if;
    if jsonb_typeof(sl->'heading')<>'string' or length(btrim(sl->>'heading')) not between 1 and 120 or
    jsonb_typeof(sl->'bullets')<>'array' or jsonb_array_length(sl->'bullets') not between 1 and 6 then return false; end if;
    for s in select * from jsonb_array_elements(sl->'bullets') loop
     if jsonb_typeof(s)<>'string' or length(btrim(s #>> '{}')) not between 1 and 200 then return false; end if;
    end loop;
    art:=sl->'art';
    if jsonb_typeof(art)<>'object' or not (art ?& array['scene','items']) or
    exists(select 1 from jsonb_object_keys(art) k where k not in ('scene','items')) then return false; end if;
    if jsonb_typeof(art->'scene')<>'string' or art->>'scene' not in ('auto','flow','compare','timeline','cycle','layers','hub','decision','balance','network','chain','conversation','phone','document','database','robot') or
    jsonb_typeof(art->'items')<>'array' or jsonb_array_length(art->'items') not between 1 and 6 then return false; end if;
    for s in select * from jsonb_array_elements(art->'items') loop
     if jsonb_typeof(s)<>'string' or length(btrim(s #>> '{}')) not between 1 and 80 then return false; end if;
    end loop;
   end loop;
  end if;
  question_ids:='{}';
  for q in select * from jsonb_array_elements(l->'questions') loop
   if jsonb_typeof(q)<>'object' or not (q ?& array['id','prompt','options','correctIndex','explanation']) or
   exists(select 1 from jsonb_object_keys(q) k where k not in ('id','prompt','options','correctIndex','explanation')) then return false; end if;
   v:=q->>'id'; if jsonb_typeof(q->'id')<>'string' or length(v) not between 1 and 80 or v !~ '^[A-Za-z0-9_-]+$' or v=any(question_ids) then return false; end if; question_ids:=array_append(question_ids,v);
   if jsonb_typeof(q->'prompt')<>'string' or length(btrim(q->>'prompt')) not between 1 and 1500 or
   jsonb_typeof(q->'explanation')<>'string' or length(q->>'explanation')>2500 or
   jsonb_typeof(q->'options')<>'array' or jsonb_array_length(q->'options') not between 2 and 5 or
   jsonb_typeof(q->'correctIndex')<>'number' or (q->>'correctIndex') !~ '^[0-4]$' or
   (q->>'correctIndex')::integer>=jsonb_array_length(q->'options') then return false; end if;
   for s in select * from jsonb_array_elements(q->'options') loop
    if jsonb_typeof(s)<>'string' or length(btrim(s #>> '{}')) not between 1 and 500 then return false; end if;
   end loop;
  end loop;
 end loop;
 return true;
exception when others then return false;
end $$;
