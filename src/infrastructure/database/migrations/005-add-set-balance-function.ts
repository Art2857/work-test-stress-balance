import { QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface) => {
  await queryInterface.sequelize.query(`
    CREATE OR REPLACE FUNCTION set_user_balance(
      user_id INTEGER,
      new_balance DECIMAL(15, 2)
    )
    RETURNS TABLE(
      id INTEGER,
      balance DECIMAL(15, 2),
      success BOOLEAN,
      message TEXT
    )
    LANGUAGE plpgsql
    AS $$
    DECLARE
      user_exists BOOLEAN;
    BEGIN
      SELECT EXISTS(SELECT 1 FROM users WHERE users.id = user_id) INTO user_exists;
      
      IF NOT user_exists THEN
        RETURN QUERY SELECT user_id, 0::DECIMAL(15, 2), FALSE, 'User not found'::TEXT;
        RETURN;
      END IF;
      
      IF new_balance < 0 THEN
        RETURN QUERY SELECT user_id, 0::DECIMAL(15, 2), FALSE, 'Balance cannot be negative'::TEXT;
        RETURN;
      END IF;
      
      UPDATE users 
      SET 
        balance = new_balance,
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE users.id = user_id;
      
      RETURN QUERY SELECT user_id, new_balance, TRUE, 'Balance set successfully'::TEXT;
    END;
    $$;
  `);
};

export const down = async (queryInterface: QueryInterface) => {
  await queryInterface.sequelize.query(`
    DROP FUNCTION IF EXISTS set_user_balance(INTEGER, DECIMAL);
  `);
};
