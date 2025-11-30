import { render, screen, fireEvent } from '@testing-library/react';
import Header from '@/components/layout/Header';
import { useAuth } from '@/store/authStore';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// Mock the auth store
jest.mock('@/store/authStore', () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Logged Out State', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        login: jest.fn(),
        logout: jest.fn(),
        setRole: jest.fn(),
      });
    });

    it('should render login and signup buttons when logged out', () => {
      render(<Header />);
      
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    it('should display guest navigation links', () => {
      render(<Header />);
      
      expect(screen.getByText('Browse Opportunities')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    it('should not display user menu when logged out', () => {
      render(<Header />);
      
      expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });
  });

  describe('Volunteer Role', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'volunteer',
        },
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        setRole: jest.fn(),
      });
    });

    it('should render volunteer-specific navigation links', () => {
      render(<Header />);
      
      expect(screen.getByText('My Dashboard')).toBeInTheDocument();
      expect(screen.getByText('My Applications')).toBeInTheDocument();
    });

    it('should display user name and role badge', () => {
      render(<Header />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('volunteer')).toBeInTheDocument();
    });

    it('should render logout button', () => {
      render(<Header />);
      
      const logoutButtons = screen.getAllByText('Logout');
      expect(logoutButtons.length).toBeGreaterThan(0);
    });

    it('should call logout when logout button is clicked', () => {
      const mockLogout = jest.fn();
      mockUseAuth.mockReturnValue({
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'volunteer',
        },
        isAuthenticated: true,
        login: jest.fn(),
        logout: mockLogout,
        setRole: jest.fn(),
      });

      render(<Header />);
      
      const logoutButton = screen.getAllByText('Logout')[0];
      fireEvent.click(logoutButton);
      
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe('NGO Role', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '2',
          name: 'NGO Admin',
          email: 'admin@ngo.org',
          role: 'ngo',
        },
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        setRole: jest.fn(),
      });
    });

    it('should render NGO-specific navigation links', () => {
      render(<Header />);
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('My Opportunities')).toBeInTheDocument();
      expect(screen.getByText('Volunteers')).toBeInTheDocument();
    });

    it('should display NGO role badge', () => {
      render(<Header />);
      
      expect(screen.getByText('ngo')).toBeInTheDocument();
    });
  });

  describe('Admin Role', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '3',
          name: 'Admin User',
          email: 'admin@volunteerhub.com',
          role: 'admin',
        },
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        setRole: jest.fn(),
      });
    });

    it('should render admin-specific navigation links', () => {
      render(<Header />);
      
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('NGOs')).toBeInTheDocument();
    });

    it('should display admin role badge', () => {
      render(<Header />);
      
      expect(screen.getByText('admin')).toBeInTheDocument();
    });
  });

  describe('Mobile Menu', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        login: jest.fn(),
        logout: jest.fn(),
        setRole: jest.fn(),
      });
    });

    it('should toggle mobile menu when hamburger is clicked', () => {
      render(<Header />);
      
      const hamburgerButton = screen.getByLabelText('Toggle menu');
      
      // Mobile menu should be hidden initially
      expect(screen.queryByText('Browse Opportunities')).toBeInTheDocument(); // Desktop nav
      
      // Click to open
      fireEvent.click(hamburgerButton);
      
      // Mobile menu items should be visible (duplicated in mobile menu)
      const opportunityLinks = screen.getAllByText('Browse Opportunities');
      expect(opportunityLinks.length).toBeGreaterThan(1);
    });
  });
});
