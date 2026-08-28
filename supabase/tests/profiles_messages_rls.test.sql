begin;

select plan(15);

insert into auth.users (id, email)
values
  ('11111111-1111-1111-1111-111111111111', 'owner@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'other@example.com');

set local role anon;

select throws_ok(
  $$select * from public.profiles$$,
  '42501',
  null,
  'anon cannot read profiles'
);

select throws_ok(
  $$select * from public.messages$$,
  '42501',
  null,
  'anon cannot read messages'
);

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

select results_eq(
  $$insert into public.profiles (id, display_name)
    values ('11111111-1111-1111-1111-111111111111', 'Owner')
    returning display_name$$,
  array['Owner'],
  'the owner creates their own profile'
);

select results_eq(
  $$select display_name from public.profiles
    where id = '11111111-1111-1111-1111-111111111111'$$,
  array['Owner'],
  'the owner reads their profile'
);

select results_eq(
  $$update public.profiles
    set display_name = 'Owner Updated'
    where id = '11111111-1111-1111-1111-111111111111'
    returning display_name$$,
  array['Owner Updated'],
  'the owner updates their profile'
);

set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

select results_eq(
  $$insert into public.profiles (id, display_name)
    values ('22222222-2222-2222-2222-222222222222', 'Other')
    returning display_name$$,
  array['Other'],
  'another user creates their own profile'
);

select results_eq(
  $$select display_name from public.profiles
    where id = '11111111-1111-1111-1111-111111111111'$$,
  array['Owner Updated'],
  'an authenticated teammate reads a profile'
);

select throws_ok(
  $$insert into public.profiles (id, display_name)
    values ('11111111-1111-1111-1111-111111111111', 'Stolen')$$,
  '42501',
  null,
  'another user cannot create a profile for the owner'
);

select is_empty(
  $$update public.profiles
    set display_name = 'Stolen'
    where id = '11111111-1111-1111-1111-111111111111'
    returning display_name$$,
  'another user updates no owner profile rows'
);

set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

select results_eq(
  $$select display_name from public.profiles
    where id = '11111111-1111-1111-1111-111111111111'$$,
  array['Owner Updated'],
  'the denied profile update leaves the owner row intact'
);

select results_eq(
  $$insert into public.messages (sender_id, body)
    values ('11111111-1111-1111-1111-111111111111', 'Owner message')
    returning body$$,
  array['Owner message'],
  'the owner sends a message as themselves'
);

set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

select throws_ok(
  $$insert into public.messages (sender_id, body)
    values ('11111111-1111-1111-1111-111111111111', 'Impersonated message')$$,
  '42501',
  null,
  'another user cannot send a message as the owner'
);

select results_eq(
  $$select body from public.messages
    where sender_id = '11111111-1111-1111-1111-111111111111'$$,
  array['Owner message'],
  'an authenticated teammate reads group messages'
);

select throws_ok(
  $$update public.messages set body = 'Edited'$$,
  '42501',
  null,
  'authenticated users cannot edit messages'
);

select throws_ok(
  $$delete from public.messages$$,
  '42501',
  null,
  'authenticated users cannot delete messages'
);

select * from finish();
rollback;
