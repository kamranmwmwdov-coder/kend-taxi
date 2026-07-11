alter table local_trip_orders
  add column passenger_count int not null default 1 check (passenger_count > 0),
  add column extra_luggage boolean not null default false,
  add column luggage_info text;
