require 'rails_helper'

describe ErrorPolicy do
  subject { ErrorPolicy }

  let(:error) { FactoryGirl.build(:error) }

  permissions :index? do
    it 'grants access to admins' do
      expect(subject).to permit(FactoryGirl.build(:admin), error)
    end

    it 'grants access to teachers' do
      expect(subject).to permit(FactoryGirl.build(:teacher), error)
    end

    it 'does not grant access to external users' do
      expect(subject).not_to permit(FactoryGirl.build(:external_user), error)
    end
  end

  permissions :show? do
    it 'grants access to admins' do
      expect(subject).to permit(FactoryGirl.build(:admin), error)
    end

    it 'grants access to authors' do
      expect(subject).to permit(error.execution_environment.author, error)
    end

    it 'does not grant access to all other users' do
      [:external_user, :teacher].each do |factory_name|
        expect(subject).not_to permit(FactoryGirl.build(factory_name), error)
      end
    end
  end
end
