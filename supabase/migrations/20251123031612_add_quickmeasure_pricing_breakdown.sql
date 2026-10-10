/*
  # Add QuickMeasure Pricing Breakdown Column

  1. Changes
    - Add `pricing_breakdown` JSONB column to `quote_submissions` table
    - This will store the complete line-item pricing details from QuickMeasure
    
  2. Purpose
    - Store calculated pricing details so office team can see breakdown in emails
    - No need to open QuickMeasure images to understand pricing
    
  3. Pricing Breakdown Structure
    {
      "house_measurements": {
        "footage": 91.42,
        "rate": 7.00,
        "total": 640.07
      },
      "power_cord": {
        "footage": 44.00,
        "rate": 5.00,
        "total": 220.00
      },
      "manual_input": {
        "footage": 44.00,
        "rate": 7.00,
        "total": 308.00
      },
      "trees": {
        "footage": 0,
        "rate": 3.50,
        "total": 0
      },
      "discount": 0,
      "subtotal": 1168.07,
      "grand_total": 1168.07
    }
*/

-- Add pricing_breakdown column
ALTER TABLE quote_submissions
ADD COLUMN IF NOT EXISTS pricing_breakdown JSONB DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN quote_submissions.pricing_breakdown IS 'Complete line-item pricing breakdown from QuickMeasure tool';
