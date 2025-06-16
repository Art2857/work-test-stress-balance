import { QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface) => {
  await queryInterface.sequelize.query(`
    CREATE OR REPLACE FUNCTION update_user_balance(
      user_id INTEGER,
      amount DECIMAL(15, 2)
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
      affected_rows INTEGER;
      result_balance DECIMAL(15, 2);
    BEGIN
      UPDATE users 
      SET 
        balance = users.balance + amount,
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE 
        users.id = user_id 
        AND (users.balance + amount) >= 0
      RETURNING users.balance INTO result_balance;
      
      GET DIAGNOSTICS affected_rows = ROW_COUNT;
      
      IF affected_rows = 0 THEN
        IF NOT EXISTS (SELECT 1 FROM users WHERE users.id = user_id) THEN
          RETURN QUERY SELECT user_id, 0::DECIMAL(15, 2), FALSE, 'User not found'::TEXT;
        ELSE
          SELECT users.balance INTO result_balance FROM users WHERE users.id = user_id;
          RETURN QUERY SELECT user_id, result_balance, FALSE, 'Insufficient balance'::TEXT;
        END IF;
      ELSE
        RETURN QUERY SELECT user_id, result_balance, TRUE, 'Balance updated successfully'::TEXT;
      END IF;
    END;
    $$;
  `);
};

export const down = async (queryInterface: QueryInterface) => {
  await queryInterface.sequelize.query(`
    CREATE OR REPLACE FUNCTION update_user_balance(
      user_id INTEGER,
      amount DECIMAL(15, 2)
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
      affected_rows INTEGER;
      result_balance DECIMAL(15, 2);
    BEGIN
      UPDATE users 
      SET 
        balance = balance + amount,
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE 
        users.id = user_id 
        AND (balance + amount) >= 0
      RETURNING users.balance INTO result_balance;
      
      GET DIAGNOSTICS affected_rows = ROW_COUNT;
      
      IF affected_rows = 0 THEN
        IF NOT EXISTS (SELECT 1 FROM users WHERE id = user_id) THEN
          RETURN QUERY SELECT user_id, 0::DECIMAL(15, 2), FALSE, 'User not found'::TEXT;
        ELSE
          SELECT balance INTO result_balance FROM users WHERE id = user_id;
          RETURN QUERY SELECT user_id, result_balance, FALSE, 'Insufficient balance'::TEXT;
        END IF;
      ELSE
        RETURN QUERY SELECT user_id, result_balance, TRUE, 'Balance updated successfully'::TEXT;
      END IF;
    END;
    $$;
  `);
};
