create table push_subscriptions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    subscription text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id)
);
