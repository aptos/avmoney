class User < CouchRest::Model::Base
  property :email, type: String
  property :admin, TrueClass, :default => false, :read_only => true
  property :provider, type: String
  property :name, String
  property :info, Hash
  property :visits, Integer, default: 1
  property :auth_token, String
  unique_id :email
  timestamps!

  before_create { generate_auth_token }

  def self.from_omniauth(auth)
    User.find(auth['info']['email']) || create_with_omniauth(auth)
  end

  def self.create_with_omniauth(auth)
    create! do |user|
      user.email = auth['info']['email']
      user.name = auth['info']['name']
      user.info = auth['info']
    end
  end

  design do
    view :by_email
    view :by_auth_token
  end

  def generate_auth_token
    begin
      self[:auth_token] = SecureRandom.urlsafe_base64(12,false)
    end while User.by_auth_token.key(self[:auth_token]).first
  end

end
