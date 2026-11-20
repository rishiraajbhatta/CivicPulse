    package com.civicpulse.backend.dto;

    import jakarta.validation.constraints.Email;
    import jakarta.validation.constraints.NotBlank;
    import jakarta.validation.constraints.Size;

    public class CitizenRegisterRequest {

        @NotBlank(message = "Full name is required")
        @Size(max = 100, message = "Full name cannot exceed 100 characters")
        private String fullName;

        @NotBlank(message = "Email is required")
        @Email(message = "Please enter a valid email address")
        @Size(max = 150)
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 100,
            message = "Password must contain between 8 and 100 characters")
        private String password;

        @Size(max = 15)
        private String phone;

        @Size(max = 255)
        private String address;

        public CitizenRegisterRequest() {
        }

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getAddress() {
            return address;
        }

        public void setAddress(String address) {
            this.address = address;
        }
    }