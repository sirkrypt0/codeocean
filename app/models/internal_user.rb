class InternalUser < User

  authenticates_with_sorcery!

  validates :email, presence: true, uniqueness: true, case_sensitive: false
  validates :password, confirmation: true, if: :password_void?, on: :update, presence: true
  validates :role, inclusion: {in: ROLES}

  def activated?
    activation_state == 'active'
  end

  def password_void?
    activation_token? || reset_password_token?
  end
  private :password_void?

  def teacher?
    role == 'teacher'
  end

  def displayname
    name
  end

end
