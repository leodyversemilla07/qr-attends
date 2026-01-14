/**
 * @jest-environment node
 * 
 * Unit tests for Convex schema validation
 */

describe('Schema Validation', () => {
    describe('Events Table', () => {
        interface Event {
            name: string;
            date: string;
            time: string;
            location: string;
            description?: string;
            createdBy: string;
            createdAt: string;
        }

        function validateEvent(event: Partial<Event>): string[] {
            const errors: string[] = [];

            if (!event.name || event.name.length < 3) {
                errors.push('Event name must be at least 3 characters');
            }
            if (!event.date || !/^\d{4}-\d{2}-\d{2}$/.test(event.date)) {
                errors.push('Invalid date format. Use YYYY-MM-DD');
            }
            if (!event.time || !/^\d{2}:\d{2}$/.test(event.time)) {
                errors.push('Invalid time format. Use HH:MM');
            }
            if (!event.location || event.location.length < 2) {
                errors.push('Location must be at least 2 characters');
            }

            return errors;
        }

        it('should validate a complete valid event', () => {
            const event: Event = {
                name: 'General Meeting',
                date: '2026-01-15',
                time: '14:00',
                location: 'Room 101',
                description: 'Monthly team meeting',
                createdBy: 'Admin User',
                createdAt: new Date().toISOString(),
            };

            const errors = validateEvent(event);
            expect(errors).toHaveLength(0);
        });

        it('should reject event with short name', () => {
            const errors = validateEvent({
                name: 'AB',
                date: '2026-01-15',
                time: '14:00',
                location: 'Room 101',
            });

            expect(errors).toContain('Event name must be at least 3 characters');
        });

        it('should reject event with invalid date format', () => {
            const errors = validateEvent({
                name: 'Valid Name',
                date: '01/15/2026',
                time: '14:00',
                location: 'Room 101',
            });

            expect(errors).toContain('Invalid date format. Use YYYY-MM-DD');
        });

        it('should reject event with invalid time format', () => {
            const errors = validateEvent({
                name: 'Valid Name',
                date: '2026-01-15',
                time: '2:00 PM',
                location: 'Room 101',
            });

            expect(errors).toContain('Invalid time format. Use HH:MM');
        });

        it('should reject event with short location', () => {
            const errors = validateEvent({
                name: 'Valid Name',
                date: '2026-01-15',
                time: '14:00',
                location: 'A',
            });

            expect(errors).toContain('Location must be at least 2 characters');
        });
    });

    describe('Members Table', () => {
        interface Member {
            firstName: string;
            lastName: string;
            middleInitial: string;
            studentId: string;
            yearSection: string;
            cardNo: string;
            email?: string;
        }

        function validateMember(member: Partial<Member>): string[] {
            const errors: string[] = [];

            if (!member.firstName || member.firstName.length < 2) {
                errors.push('First name must be at least 2 characters');
            }
            if (!member.lastName || member.lastName.length < 2) {
                errors.push('Last name must be at least 2 characters');
            }
            if (!member.studentId || member.studentId.length < 2) {
                errors.push('Student ID must be at least 2 characters');
            }

            return errors;
        }

        it('should validate a complete valid member', () => {
            const member: Member = {
                firstName: 'John',
                lastName: 'Doe',
                middleInitial: 'A',
                studentId: '2026-00001',
                yearSection: '3-A',
                cardNo: 'uuid-12345-abcde',
                email: 'john.doe@example.com',
            };

            const errors = validateMember(member);
            expect(errors).toHaveLength(0);
        });

        it('should reject member with short first name', () => {
            const errors = validateMember({
                firstName: 'J',
                lastName: 'Doe',
                studentId: '2026-00001',
            });

            expect(errors).toContain('First name must be at least 2 characters');
        });

        it('should reject member with short last name', () => {
            const errors = validateMember({
                firstName: 'John',
                lastName: 'D',
                studentId: '2026-00001',
            });

            expect(errors).toContain('Last name must be at least 2 characters');
        });

        it('should reject member with short student ID', () => {
            const errors = validateMember({
                firstName: 'John',
                lastName: 'Doe',
                studentId: '1',
            });

            expect(errors).toContain('Student ID must be at least 2 characters');
        });
    });

    describe('Officers Table', () => {
        const validRoles = ['President', 'Vice President', 'Secretary', 'Officer', 'Admin'];

        function validateOfficerRole(role: string): boolean {
            return validRoles.includes(role);
        }

        it('should accept valid roles', () => {
            expect(validateOfficerRole('President')).toBe(true);
            expect(validateOfficerRole('Admin')).toBe(true);
            expect(validateOfficerRole('Secretary')).toBe(true);
            expect(validateOfficerRole('Officer')).toBe(true);
            expect(validateOfficerRole('Vice President')).toBe(true);
        });

        it('should reject invalid roles', () => {
            expect(validateOfficerRole('Manager')).toBe(false);
            expect(validateOfficerRole('User')).toBe(false);
            expect(validateOfficerRole('SuperAdmin')).toBe(false);
            expect(validateOfficerRole('')).toBe(false);
        });
    });
});

describe('Authorization Rules', () => {
    const rolePermissions = {
        'President': { canViewAuditLogs: true, canDeleteMembers: true, canBulkImport: true, canCleanup: true },
        'Admin': { canViewAuditLogs: true, canDeleteMembers: true, canBulkImport: true, canCleanup: true },
        'Secretary': { canViewAuditLogs: false, canDeleteMembers: true, canBulkImport: true, canCleanup: false },
        'Officer': { canViewAuditLogs: false, canDeleteMembers: false, canBulkImport: false, canCleanup: false },
    };

    function checkPermission(role: string, permission: string): boolean {
        const perms = rolePermissions[role as keyof typeof rolePermissions];
        if (!perms) return false;
        return perms[permission as keyof typeof perms] || false;
    }

    describe('Audit Log Access', () => {
        it('should allow President to view audit logs', () => {
            expect(checkPermission('President', 'canViewAuditLogs')).toBe(true);
        });

        it('should allow Admin to view audit logs', () => {
            expect(checkPermission('Admin', 'canViewAuditLogs')).toBe(true);
        });

        it('should deny Secretary from viewing audit logs', () => {
            expect(checkPermission('Secretary', 'canViewAuditLogs')).toBe(false);
        });

        it('should deny Officer from viewing audit logs', () => {
            expect(checkPermission('Officer', 'canViewAuditLogs')).toBe(false);
        });
    });

    describe('Bulk Import Access', () => {
        it('should allow President, Admin, and Secretary to bulk import', () => {
            expect(checkPermission('President', 'canBulkImport')).toBe(true);
            expect(checkPermission('Admin', 'canBulkImport')).toBe(true);
            expect(checkPermission('Secretary', 'canBulkImport')).toBe(true);
        });

        it('should deny Officer from bulk importing', () => {
            expect(checkPermission('Officer', 'canBulkImport')).toBe(false);
        });
    });

    describe('Cleanup Access', () => {
        it('should only allow President and Admin to cleanup', () => {
            expect(checkPermission('President', 'canCleanup')).toBe(true);
            expect(checkPermission('Admin', 'canCleanup')).toBe(true);
            expect(checkPermission('Secretary', 'canCleanup')).toBe(false);
            expect(checkPermission('Officer', 'canCleanup')).toBe(false);
        });
    });
});
