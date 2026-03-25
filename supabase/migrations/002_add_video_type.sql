-- Add video type to artifacts table
ALTER TABLE artifacts 
DROP CONSTRAINT artifacts_type_check;

ALTER TABLE artifacts 
ADD CONSTRAINT artifacts_type_check 
CHECK (type IN ('audio', 'image', 'text', 'video', 'mixed'));
