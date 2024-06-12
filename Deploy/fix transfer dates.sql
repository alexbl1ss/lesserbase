select 
	booking.id as booking_id,
	product_id,
    product.name as product_name,
    booking.student_id,
    actual_charge,
    stay.start as stay_start,
    stay.end as stay_end
from booking
join product on product_id = product.id
join stay on booking.student_id = stay.student_id
where product.name = "Transfer IN"
and custom_start is null
and custom_end is null
and product.start_date is null
and product.end_date is null;

select 
	booking.id as booking_id,
	product_id,
    product.name as product_name,
    booking.student_id,
    actual_charge,
    stay.start as stay_start,
    stay.end as stay_end
from booking
join product on product_id = product.id
join stay on booking.student_id = stay.student_id
where product.name = "Transfer OUT"
and custom_start is null
and custom_end is null
and product.start_date is null
and product.end_date is null;

UPDATE booking
JOIN product ON booking.product_id = product.id
JOIN stay ON booking.student_id = stay.student_id
SET 
    booking.custom_start = stay.start,
    booking.custom_end = stay.start
WHERE 
    product.name = 'Transfer IN' AND
    booking.custom_start IS NULL AND
    booking.custom_end IS NULL AND
    product.start_date IS NULL AND
    product.end_date IS NULL;
    
UPDATE booking
JOIN product ON booking.product_id = product.id
JOIN stay ON booking.student_id = stay.student_id
SET 
    booking.custom_start = stay.end,
    booking.custom_end = stay.end
WHERE 
    product.name = 'Transfer OUT' AND
    booking.custom_start IS NULL AND
    booking.custom_end IS NULL AND
    product.start_date IS NULL AND
    product.end_date IS NULL;

