-- タイムゾーン設定
alter database postgres set timezone to 'Asia/Tokyo';

-- postsテーブル作成
create table posts (
  id uuid not null default uuid_generate_v4() primary key,
  prompt text not null,
  content text,
  updated_at timestamp default now() not null,
  created_at timestamp default now() not null
);

-- postsテーブルRLS設定
alter table posts enable row level security;
create policy "誰でも参照可能" on posts for select using ( true );
create policy "誰でも追加可能" on posts for insert with check ( true );
create policy "誰でも更新可能" on posts for update using ( true );

-- updated_at更新
create extension if not exists moddatetime schema extensions;
create trigger handle_updated_at before update on posts
  for each row execute procedure moddatetime (updated_at);
