import { loginSchema, volunteerSignupSchema, ngoSignupSchema } from '@/lib/validations/auth.schema';

describe('Auth Form Validation', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path[0]).toBe('email');
      }
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path[0]).toBe('password');
      }
    });
  });

  describe('volunteerSignupSchema', () => {
    it('should validate correct volunteer signup data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        phone: '+1234567890',
      };

      const result = volunteerSignupSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject name less than 2 characters', () => {
      const invalidData = {
        name: 'J',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      };

      const result = volunteerSignupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path[0]).toBe('name');
        expect(result.error.issues[0].message).toContain('at least 2 characters');
      }
    });

    it('should reject password without uppercase letter', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const result = volunteerSignupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordError = result.error.issues.find((issue) => issue.path[0] === 'password');
        expect(passwordError?.message).toContain('uppercase');
      }
    });

    it('should reject password without number', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'PasswordABC',
        confirmPassword: 'PasswordABC',
      };

      const result = volunteerSignupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordError = result.error.issues.find((issue) => issue.path[0] === 'password');
        expect(passwordError?.message).toContain('number');
      }
    });

    it('should reject password less than 8 characters', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Pass1',
        confirmPassword: 'Pass1',
      };

      const result = volunteerSignupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordError = result.error.issues.find((issue) => issue.path[0] === 'password');
        expect(passwordError?.message).toContain('at least 8 characters');
      }
    });

    it('should reject mismatched passwords', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'DifferentPassword123',
      };

      const result = volunteerSignupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const confirmError = result.error.issues.find((issue) => issue.path[0] === 'confirmPassword');
        expect(confirmError?.message).toContain("don't match");
      }
    });

    it('should accept valid phone number', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        phone: '+1234567890',
      };

      const result = volunteerSignupSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid phone number', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        phone: 'invalid-phone',
      };

      const result = volunteerSignupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const phoneError = result.error.issues.find((issue) => issue.path[0] === 'phone');
        expect(phoneError?.message).toContain('Invalid phone number');
      }
    });
  });

  describe('ngoSignupSchema', () => {
    it('should validate correct NGO signup data', () => {
      const validData = {
        organizationName: 'Test NGO',
        email: 'contact@testngo.org',
        password: 'Password123',
        confirmPassword: 'Password123',
        phone: '+1234567890',
        website: 'https://testngo.org',
        description: 'We are a test NGO working for good causes.',
        registrationNumber: 'REG123456',
      };

      const result = ngoSignupSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject organization name less than 2 characters', () => {
      const invalidData = {
        organizationName: 'T',
        email: 'contact@testngo.org',
        password: 'Password123',
        confirmPassword: 'Password123',
      };

      const result = ngoSignupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path[0]).toBe('organizationName');
      }
    });

    it('should reject invalid website URL', () => {
      const invalidData = {
        organizationName: 'Test NGO',
        email: 'contact@testngo.org',
        password: 'Password123',
        confirmPassword: 'Password123',
        website: 'not-a-url',
      };

      const result = ngoSignupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const websiteError = result.error.issues.find((issue) => issue.path[0] === 'website');
        expect(websiteError?.message).toContain('Invalid URL');
      }
    });

    it('should accept optional fields as empty', () => {
      const validData = {
        organizationName: 'Test NGO',
        email: 'contact@testngo.org',
        password: 'Password123',
        confirmPassword: 'Password123',
        phone: '',
        website: '',
      };

      const result = ngoSignupSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject description less than 10 characters', () => {
      const invalidData = {
        organizationName: 'Test NGO',
        email: 'contact@testngo.org',
        password: 'Password123',
        confirmPassword: 'Password123',
        description: 'Short',
      };

      const result = ngoSignupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const descError = result.error.issues.find((issue) => issue.path[0] === 'description');
        expect(descError?.message).toContain('at least 10 characters');
      }
    });
  });
});
